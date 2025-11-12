'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useI18n } from '../../../components/I18nProviderClient'
import { Package, Heart, Eye, User, MapPin, Calendar, DollarSign, MessageCircle } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

type Item = {
  id: number
  title: string
  description?: string
  price?: number
  image_url?: string
  image_urls?: string[]
  owner_username?: string
  owner?: number
  created_at?: string
  likes?: number
  views?: number
  condition?: string
  location?: string
  is_barter?: boolean
  desired_item?: string
  category?: string
}

export default function ItemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useI18n()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showChatModal, setShowChatModal] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('access')
        const headers: HeadersInit = { 'Content-Type': 'application/json' }
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
        
        const res = await fetch(`${API}/items/${params.id}/`, { headers })
        if (!res.ok) {
          throw new Error('Item not found')
        }
        const data = await res.json()
        setItem(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load item')
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [params.id])

  const handleAddToCart = async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const res = await fetch(`${API}/cart/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: item?.id, quantity: 1 })
      })
      if (res.ok) {
        alert(t('cart.added', 'Added to cart'))
      }
    } catch (err) {
      alert(t('cart.error', 'Operation failed'))
    }
  }

  const handleAddToWishlist = async () => {
    const token = localStorage.getItem('access')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const res = await fetch(`${API}/wishlist/add/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ item_id: item?.id })
      })
      if (res.ok) {
        alert(t('wishlist.added', 'Added to wishlist'))
      }
    } catch (err) {
      alert(t('wishlist.error', 'Operation failed'))
    }
  }

  const handleContactSeller = () => {
    const token = localStorage.getItem('access')
    if (!token) {
      router.push('/login')
      return
    }
    if (!item?.owner) {
      alert(t('item.noOwner', 'Cannot contact seller'))
      return
    }
    setShowChatModal(true)
  }

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !item?.owner) {
      if (!item?.owner) {
        alert(t('item.noOwner', 'Cannot contact seller'))
      }
      return
    }
    
    const token = localStorage.getItem('access')
    if (!token) {
      router.push('/login')
      return
    }

    setSendingMessage(true)
    try {
      const requestBody = {
        receiver: item.owner, // This should be the user ID (number)
        item: item.id, // Item ID (optional, can be null)
        text: chatMessage.trim()
      }
      
      console.log('Sending message:', requestBody)
      
      const res = await fetch(`${API}/chat/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      })
      
      if (res.ok) {
        setChatMessage('')
        setShowChatModal(false)
        alert(t('chat.sent', 'Message sent'))
        // Optional: navigate to chat page
        router.push('/chat')
      } else {
        const data = await res.json()
        // Show detailed error message
        let errorMsg = t('chat.failed', 'Failed to send')
        if (data?.detail) {
          errorMsg = data.detail
        } else if (data?.non_field_errors) {
          errorMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors.join(', ') : data.non_field_errors
        } else if (data) {
          // Show first field error if available
          const firstError = Object.values(data)[0]
          if (Array.isArray(firstError)) {
            errorMsg = firstError[0]
          } else if (typeof firstError === 'string') {
            errorMsg = firstError
          }
        }
        console.error('Chat message error:', data)
        alert(errorMsg)
      }
    } catch (err) {
      console.error('Chat message exception:', err)
      alert(t('chat.error', 'Error sending message'))
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="container-app mt-8">
        <div className="card">
          <div className="card-body">
            <div className="h-96 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="container-app mt-8">
        <div className="card">
          <div className="card-body text-center py-16">
            <h3 className="text-lg font-semibold">{t('error.notFound', 'Item not found')}</h3>
            <button onClick={() => router.push('/')} className="btn-primary mt-4">
              {t('common.back', 'Back to home')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="card overflow-hidden">
            {(item.image_urls && item.image_urls.length > 0) || item.image_url ? (
              <img
                src={
                  item.image_urls && item.image_urls.length > 0 
                    ? item.image_urls[selectedImageIndex] 
                    : item.image_url
                }
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                <Package className="h-24 w-24 text-slate-400" />
              </div>
            )}
          </div>
          
          {/* Thumbnail Gallery */}
          {item.image_urls && item.image_urls.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {item.image_urls.map((url, index) => (
                <div 
                  key={index} 
                  className={`card overflow-hidden cursor-pointer transition-all ${
                    selectedImageIndex === index 
                      ? 'ring-2 ring-indigo-500 opacity-100' 
                      : 'hover:opacity-80 opacity-60'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={url}
                    alt={`${item.title} - ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-body">
              <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
              
              <div className="flex items-center gap-6 mb-6">
                {item.price != null && (
                  <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400">
                    {item.price} {t('item.priceSymbol', 'THB')}
                  </div>
                )}
                {item.is_barter && (
                  <div className="px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                    {t('item.barter', 'Barter')}
                  </div>
                )}
              </div>

              {item.description && (
                <p className="text-slate-600 dark:text-slate-300 mb-6 whitespace-pre-wrap">
                  {item.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {item.condition && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Package className="h-4 w-4" />
                    <span>{t('item.condition', 'Condition')}: {item.condition}</span>
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                )}
                {item.owner_username && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <User className="h-4 w-4" />
                    <span>{item.owner_username}</span>
                  </div>
                )}
                {item.created_at && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {item.is_barter && item.desired_item && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    {t('item.desiredItem', 'Desired item')}:
                  </div>
                  <div className="text-blue-700 dark:text-blue-400">{item.desired_item}</div>
                </div>
              )}

              <div className="flex gap-3">
                {!item.is_barter && (
                  <button onClick={handleAddToCart} className="btn-primary flex-1">
                    {t('cart.add', 'Add to Cart')}
                  </button>
                )}
                <button onClick={handleContactSeller} className="btn-primary flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('item.contactSeller', 'Contact Seller')}
                </button>
                <button onClick={handleAddToWishlist} className="btn-outline">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{item.views ?? 0} {t('item.views', 'views')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{item.likes ?? 0} {t('item.likes', 'likes')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">{t('item.contactSeller', 'Contact Seller')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('item.sendMessageTo', 'Send message to')}: <strong>{item.owner_username}</strong>
            </p>
            <textarea
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={t('item.messagePlaceholder', 'Enter your message...')}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg mb-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
              disabled={sendingMessage}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChatModal(false)
                  setChatMessage('')
                }}
                className="btn-outline flex-1"
                disabled={sendingMessage}
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleSendMessage}
                className="btn-primary flex-1"
                disabled={sendingMessage || !chatMessage.trim()}
              >
                {sendingMessage ? t('chat.sending', 'Sending...') : t('chat.send', 'Send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

