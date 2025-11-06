'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../components/I18nProviderClient'
import { useAuth } from '../../components/AuthProvider'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { login, isAuthenticated } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleLogin = async () => {
    setLoading(true)
    setMsg('')
    const result = await login(username, password)
    setLoading(false)
    if (result.success) {
      setMsg(t('auth.login.success', 'เข้าสู่ระบบสำเร็จ'))
      setTimeout(() => router.push('/'), 1000)
    } else {
      setMsg(result.error || t('auth.login.fail', 'เข้าสู่ระบบล้มเหลว'))
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <div className="card-body space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('auth.login.title', 'เข้าสู่ระบบ')}</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('auth.login.username', 'ชื่อผู้ใช้')}</label>
            <input className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('auth.login.password', 'รหัสผ่าน')}</label>
            <input type="password" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? t('auth.login.loading', 'กำลังเข้าสู่ระบบ...') : t('auth.login.submit', 'เข้าสู่ระบบ')}</button>
          {msg && <div className={`text-sm ${msg.includes('成功') || msg.includes('success') || msg.includes('สำเร็จ') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
          <p className="text-center text-sm text-gray-500">{t('auth.login.noAccount', 'ยังไม่มีบัญชี?')} <a className="text-brand-700 hover:underline" href="/register">{t('auth.register.title', 'สมัครสมาชิก')}</a></p>
        </div>
      </div>
    </div>
  )
}
