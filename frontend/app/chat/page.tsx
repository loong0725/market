'use client'
import { useEffect, useState } from 'react'
import { useI18n } from '../../components/I18nProviderClient'
import { useAuth } from '../../components/AuthProvider'
import ProtectedRoute from '../../components/ProtectedRoute'
import { MessageCircle, Send, User, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

type Message = {
  id: number
  sender: number
  sender_username: string
  receiver: number
  receiver_username: string
  item: number | null
  text: string
  created_at: string
}

type Conversation = {
  userId: number
  username: string
  lastMessage: Message
  unreadCount: number
  messages: Message[]
}

function ChatPageContent() {
  const { t } = useI18n()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null
    return token ? { 
      Authorization: `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    } : { 'Content-Type': 'application/json' }
  }

  const loadMessages = async () => {
    try {
      const r = await fetch(`${API}/chat/messages/`, { headers: authHeaders() })
      if (r.ok) {
        const data = await r.json()
        const msgs = Array.isArray(data?.results || data) ? (data.results || data) : []
        setMessages(msgs)
        groupMessagesIntoConversations(msgs)
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const groupMessagesIntoConversations = (msgs: Message[]) => {
    if (!user) return

    const convMap = new Map<number, Conversation>()

    msgs.forEach((msg) => {
      // Determine the other user in the conversation
      const otherUserId = msg.sender === user.id ? msg.receiver : msg.sender
      const otherUsername = msg.sender === user.id ? msg.receiver_username : msg.sender_username

      if (!convMap.has(otherUserId)) {
        convMap.set(otherUserId, {
          userId: otherUserId,
          username: otherUsername,
          lastMessage: msg,
          unreadCount: 0, // You can implement unread tracking later
          messages: []
        })
      }

      const conv = convMap.get(otherUserId)!
      conv.messages.push(msg)
      
      // Update last message if this is newer
      if (new Date(msg.created_at) > new Date(conv.lastMessage.created_at)) {
        conv.lastMessage = msg
      }
    })

    // Sort conversations by last message time
    const sortedConvs = Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime()
    )

    setConversations(sortedConvs)
    
    // Auto-select first conversation if none selected
    if (!selectedConversation && sortedConvs.length > 0) {
      setSelectedConversation(sortedConvs[0])
    }
  }

  const sendMessage = async (receiverId: number, itemId: number | null = null) => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const r = await fetch(`${API}/chat/messages/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          receiver: receiverId,
          item: itemId,
          text: newMessage.trim()
        })
      })

      if (r.ok) {
        setNewMessage('')
        await loadMessages()
        // Refresh selected conversation
        if (selectedConversation) {
          const updated = conversations.find(c => c.userId === receiverId)
          if (updated) setSelectedConversation(updated)
        }
      } else {
        const data = await r.json()
        alert(data?.detail || t('chat.failed', 'Failed to send'))
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      alert(t('chat.error', 'Error sending message'))
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadMessages()
      // Refresh messages every 10 seconds
      const interval = setInterval(loadMessages, 10000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      const convMessages = messages.filter(
        m => (m.sender === user?.id && m.receiver === selectedConversation.userId) ||
             (m.receiver === user?.id && m.sender === selectedConversation.userId)
      ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      
      setSelectedConversation({
        ...selectedConversation,
        messages: convMessages
      })
    }
  }, [messages, selectedConversation?.userId])

  if (loading) {
    return (
      <div className="container-app mt-8">
        <div className="card">
          <div className="card-body">
            <div className="h-64 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="btn-ghost">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageCircle className="h-6 w-6" />
          {t('chat.title', 'Messages')}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body p-0">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>{t('chat.noConversations', 'No messages yet')}</p>
                  <p className="text-sm mt-2">{t('chat.startConversation', 'Start a conversation from an item page')}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                  {conversations.map((conv) => (
                    <button
                      key={conv.userId}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${
                        selectedConversation?.userId === conv.userId
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                          {conv.username[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white truncate">
                            {conv.username}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                            {conv.lastMessage.text}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(conv.lastMessage.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages View */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <div className="card h-[600px] flex flex-col">
              {/* Conversation Header */}
              <div className="card-body border-b border-gray-200 dark:border-slate-700 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {selectedConversation.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.username}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t('chat.conversationWith', 'Conversation with')} {selectedConversation.username}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((msg) => {
                  const isOwn = msg.sender === user?.id
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwn
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {isOwn ? t('chat.you', 'You') : msg.sender_username}
                        </div>
                        <div className="text-sm">{msg.text}</div>
                        {msg.item && (
                          <Link
                            href={`/items/${msg.item}`}
                            className="text-xs mt-2 inline-flex items-center gap-1 opacity-80 hover:opacity-100"
                          >
                            <Package className="h-3 w-3" />
                            {t('chat.relatedItem', 'Related item')}
                          </Link>
                        )}
                        <div className="text-xs mt-1 opacity-70">
                          {new Date(msg.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input */}
              <div className="card-body border-t border-gray-200 dark:border-slate-700 pt-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage(selectedConversation.userId, null)
                      }
                    }}
                    placeholder={t('chat.typeMessage', 'Type a message...')}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-slate-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    disabled={sending}
                  />
                  <button
                    onClick={() => sendMessage(selectedConversation.userId, null)}
                    disabled={!newMessage.trim() || sending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? t('chat.sending', 'Sending...') : t('chat.send', 'Send')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold">{t('chat.selectConversation', 'Select a conversation')}</p>
                <p className="text-sm mt-2">{t('chat.selectToView', 'Choose a conversation from the list to view messages')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatPageContent />
    </ProtectedRoute>
  )
}
