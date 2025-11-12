'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../../components/I18nProviderClient'
import { useAuth } from '../../../components/AuthProvider'
import { apiClient } from '../../../lib/api'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

type PostInfo = {
  is_premium: boolean
  free_posts_used: number
  free_posts_remaining: number
  can_post_free: boolean
  posting_fee: number
  member_free_posts: number
}

export default function NewWantedPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [postInfo, setPostInfo] = useState<PostInfo | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    max_price: '',
    category: '',
    condition_preference: 'any',
    contact_phone: '',
    location: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadPostInfo()
  }, [isAuthenticated])

  const loadPostInfo = async () => {
    try {
      const token = localStorage.getItem('access')
      const res = await fetch(`${API}/wanted/post-info/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setPostInfo(data)
      }
    } catch (error) {
      console.error('Failed to load post info:', error)
    } finally {
      setLoadingInfo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title.trim()) {
      setMessage(t('wanted.titleRequired', '标题为必填项'))
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const token = localStorage.getItem('access')
      const payload: any = {
        ...form,
        max_price: form.max_price ? parseFloat(form.max_price) : null
      }

      // Add payment if required
      if (postInfo && !postInfo.can_post_free) {
        payload.paid_amount = postInfo.posting_fee
      }

      const res = await fetch(`${API}/wanted/wanted/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.ok) {
        setMessage(t('wanted.postSuccess', '发布成功！'))
        setTimeout(() => {
          router.push('/wanted')
        }, 1500)
      } else {
        setMessage(data?.error || data?.detail || t('wanted.postFailed', '发布失败，请重试'))
      }
    } catch (error) {
      setMessage(t('wanted.networkError', '网络错误，请检查连接'))
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || loadingInfo) {
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

  return (
    <div className="container-app mt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('wanted.postWanted', '发布求购')}</h1>

        {/* Post Info Card */}
        {postInfo && (
          <div className="card mb-6">
            <div className="card-body">
              <h3 className="text-lg font-semibold mb-4">{t('wanted.postingInfo', '发布信息')}</h3>
              
              {postInfo.can_post_free ? (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <span className="text-2xl">✓</span>
                    <div>
                      <div className="font-semibold">{t('wanted.freePostAvailable', 'Free post available')}</div>
                      <div className="text-sm">
                        {t('wanted.freePostsRemaining', 'Free posts remaining')}: {postInfo.free_posts_remaining}/{postInfo.member_free_posts}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="font-semibold text-amber-700 dark:text-amber-300 mb-2">
                      {t('wanted.paymentRequired', 'Payment Required')}: {postInfo.posting_fee} {t('item.priceSymbol', 'THB')}
                    </div>
                    {postInfo.is_premium ? (
                      <div className="text-sm text-amber-600 dark:text-amber-400">
                        {t('wanted.freePostsUsed', 'Free posts used')} ({postInfo.free_posts_used}/{postInfo.member_free_posts})
                      </div>
                    ) : (
                      <div className="text-sm text-amber-600 dark:text-amber-400">
                        {t('wanted.becomePremium', 'Become a member to get')} {postInfo.member_free_posts} {t('wanted.freePosts', 'free posts')}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>{t('wanted.note', '注意')}:</strong> {t('wanted.paymentNote', '由于平台不支持在线支付，请在发布后通过其他方式完成支付，或联系管理员。')}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('wanted.title', '标题')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
                placeholder={t('wanted.titlePlaceholder', '请输入求购商品标题')}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('wanted.description', '描述')}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input min-h-[120px]"
                placeholder={t('wanted.descriptionPlaceholder', '请输入详细描述')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('wanted.maxPrice', '最高价格')}
                </label>
                <input
                  type="number"
                  value={form.max_price}
                  onChange={(e) => setForm({ ...form, max_price: e.target.value })}
                  className="input"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('wanted.category', 'Category')}
                </label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                  placeholder={t('wanted.categoryPlaceholder', '如：家具、电子产品等')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('wanted.conditionPreference', 'Condition Preference')}
              </label>
              <select
                value={form.condition_preference}
                onChange={(e) => setForm({ ...form, condition_preference: e.target.value })}
                className="input"
              >
                <option value="any">{t('wanted.any', '任意')}</option>
                <option value="new">{t('wanted.new', '全新')}</option>
                <option value="like_new">{t('wanted.likeNew', '近新')}</option>
                <option value="good">{t('wanted.good', '良好')}</option>
                <option value="fair">{t('wanted.fair', '一般')}</option>
                <option value="poor">{t('wanted.poor', '较差')}</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('wanted.contactPhone', '联系电话')}
                </label>
                <input
                  type="text"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="input"
                  placeholder={t('wanted.phonePlaceholder', '请输入联系电话')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('wanted.location', '位置')}
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="input"
                  placeholder={t('wanted.locationPlaceholder', '如：AIT Campus')}
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded ${
                message.includes('成功') 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-outline flex-1"
                disabled={loading}
              >
                {t('common.cancel', '取消')}
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading}
              >
                {loading ? t('wanted.posting', '发布中...') : t('wanted.post', '发布')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

