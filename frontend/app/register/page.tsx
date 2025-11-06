'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../components/I18nProviderClient'
import { useAuth } from '../../components/AuthProvider'
import { apiClient } from '../../lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { register, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ username:'', password:'', confirm_password:'', email:'' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const onChange = (k: string, v: string)=> setForm(prev => ({...prev, [k]: v}))

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!form.username) {
      newErrors.username = t('auth.register.usernameRequired', '用户名不能为空')
    } else if (form.username.length < 3) {
      newErrors.username = t('auth.register.usernameTooShort', '用户名至少需要3个字符')
    }
    
    if (!form.password) {
      newErrors.password = t('auth.register.passwordRequired', '密码不能为空')
    } else if (form.password.length < 8) {
      newErrors.password = t('auth.register.passwordTooShort', '密码至少需要8个字符')
    }
    
    if (!form.confirm_password) {
      newErrors.confirm_password = t('auth.register.confirmPasswordRequired', '请确认密码')
    } else if (form.password !== form.confirm_password) {
      newErrors.confirm_password = t('auth.register.passwordsNotMatch', '两次输入的密码不一致')
    }
    
    if (!form.email) {
      newErrors.email = t('auth.register.emailRequired', '邮箱不能为空')
    } else if (!form.email.endsWith('@ait.ac.th')) {
      newErrors.email = t('auth.register.emailInvalid', '邮箱必须是以@ait.ac.th结尾')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async () => {
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setMsg('')
    
    try {
      // Register user
      const registerResult = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
      })

      if (registerResult.success) {
        setMsg(t('auth.register.success', '注册成功！'))
        setErrors({}) // Clear all errors
        setTimeout(() => router.push('/'), 1500)
      } else if (registerResult.registrationSucceeded) {
        // Registration succeeded but auto-login failed
        setMsg(t('auth.register.successButLoginFail', '注册成功！但自动登录失败，请手动登录'))
        setErrors({})
        setTimeout(() => router.push('/login'), 2000)
      } else {
        // Registration failed or auto-login failed
        const newErrors: Record<string, string> = {}
        
        // Check if it's a registration error or just auto-login failure
        if (registerResult.error && registerResult.error.includes('No active account')) {
          // This means registration succeeded but auto-login failed
          // User can still login manually
          setMsg(t('auth.register.successButLoginFail', '注册成功！但自动登录失败，请手动登录'))
          setErrors({})
          setTimeout(() => router.push('/login'), 2000)
          return
        }
        
        // Use field-specific errors if available
        if (registerResult.fieldErrors) {
          Object.entries(registerResult.fieldErrors).forEach(([key, value]) => {
            // Map backend field names to frontend field names
            if (key === 'username') {
              newErrors.username = value
            } else if (key === 'email') {
              newErrors.email = value
            } else if (key === 'password') {
              newErrors.password = value
            } else if (key === 'confirm_password' || key === 'non_field_errors') {
              // confirm_password errors or general validation errors
              newErrors.confirm_password = value
            }
          })
        }
        
        // If we have field errors, show them; otherwise show general error
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors)
          setMsg('') // Don't show general error message if we have field-specific errors
        } else {
          // Only show general error if no field-specific errors
          setMsg(registerResult.error || t('auth.register.fail', '注册失败，请重试'))
          setErrors({})
        }
      }
    } catch (error) {
      setMsg(t('auth.register.fail', 'สมัครสมาชิกล้มเหลว'))
    } finally {
    setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <div className="card-body space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('auth.register.title', 'สมัครสมาชิก')}</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('auth.register.username', 'ชื่อผู้ใช้')} <span className="text-red-500">*</span>
            </label>
            <input 
              className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
              }`}
              value={form.username}
              onChange={e=>onChange('username', e.target.value)} 
            />
            {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('auth.register.email', 'Email (@ait.ac.th)')} <span className="text-red-500">*</span>
            </label>
            <input 
              type="email"
              className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
              }`}
              placeholder="example@ait.ac.th"
              value={form.email}
              onChange={e=>onChange('email', e.target.value)} 
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('auth.register.password', 'รหัสผ่าน')} <span className="text-red-500">*</span>
            </label>
            <input 
              type="password" 
              className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
              }`}
              value={form.password}
              onChange={e=>onChange('password', e.target.value)} 
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t('auth.register.confirmPassword', '确认密码')} <span className="text-red-500">*</span>
            </label>
            <input 
              type="password" 
              className={`mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                errors.confirm_password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
              }`}
              value={form.confirm_password}
              onChange={e=>onChange('confirm_password', e.target.value)} 
            />
            {errors.confirm_password && <p className="mt-1 text-xs text-red-600">{errors.confirm_password}</p>}
          </div>
          <button onClick={handleRegister} disabled={loading} className="btn-primary w-full disabled:opacity-50">{loading ? t('auth.register.loading', 'กำลังสมัคร...') : t('auth.register.title', 'สมัครสมาชิก')}</button>
          {msg && <div className={`text-sm ${msg.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
        </div>
      </div>
    </div>
  )
}
