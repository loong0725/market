'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE

function authHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }
}

export default function ChatPage() {
  const { t } = useI18n()
  const [msgs, setMsgs] = useState<any[]>([])
  const [form, setForm] = useState({ receiver: '', text: '' })
  const [msg, setMsg] = useState('')

  const load = async () => {
    const r = await fetch(`${API}/chat/messages/`, { headers: authHeaders() })
    if (r.ok) setMsgs(await r.json())
  }

  const send = async () => {
    const r = await fetch(`${API}/chat/messages/`, { method:'POST', headers: authHeaders(), body: JSON.stringify({ receiver: parseInt(form.receiver || '0', 10), text: form.text }) })
    if (r.ok) { setMsg(t('chat.sent', 'Sent')); load(); } else { setMsg(t('chat.failed', 'Failed')); }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <h2>{t('chat.title', 'Chat')}</h2>
      <div>
        <input placeholder={t('chat.receiver', 'Receiver ID')} value={form.receiver} onChange={e=>setForm({...form, receiver:e.target.value})} />
        <input placeholder={t('chat.message', 'Message')} value={form.text} onChange={e=>setForm({...form, text:e.target.value})} />
        <button onClick={send}>{t('chat.send', 'Send')}</button>
        <div>{msg}</div>
      </div>

      <ul>
        {msgs.map(m => (
          <li key={m.id}>
            <strong>{m.sender_username}</strong> → {m.receiver_username}: {m.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
