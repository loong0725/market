'use client'
import { useEffect, useState } from 'react'
import { User, Package, ShoppingCart, Heart, Edit, Trash2, Eye, Plus, Star } from 'lucide-react'
import { useI18n } from '../../components/I18nProviderClient'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'

type UserProfile = {
  id: number
  username: string
  email: string
  ait_email?: string
  first_name?: string
  last_name?: string
  phone?: string
  bio?: string
  date_joined?: string
  is_verified?: boolean
}

type Item = {
  id: number
  title: string
  description?: string
  price?: number
  image_url?: string
  image_urls?: string[]
  is_available: boolean
  created_at: string
  owner_username?: string
}

export default function PersonalPage() {
  const { t } = useI18n()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'items' | 'orders' | 'favorites'>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [membership, setMembership] = useState<any>(null)
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    bio: ''
  })

  // Membership component
  const MembershipSection = () => {
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState('')

    const handlePurchase = async () => {
      setLoading(true)
      setMsg('')
      try {
        const response = await apiClient.createMembership(1) // 1 month
        if (response.data) {
          setMembership(response.data)
          setMsg(t('personal.membership.success', 'Membership subscription successful!'))
          setTimeout(() => setMsg(''), 3000)
        } else {
          setMsg(response.error || t('personal.membership.fail', 'Subscription failed'))
        }
      } catch (error) {
        setMsg(t('personal.membership.fail', 'Subscription failed'))
      } finally {
        setLoading(false)
      }
    }

    if (membership?.is_valid) {
      const endDate = new Date(membership.end_date)
      return (
        <div className="text-right">
          <div className="text-green-600 dark:text-green-400 font-bold mb-1">{t('personal.membership.active', '✓ Membership Active')}</div>
          <div className="text-xs text-gray-500">{t('personal.membership.expires', 'Expires:')}{endDate.toLocaleDateString('zh-CN')}</div>
        </div>
      )
    }

    return (
      <div className="text-right">
        <button onClick={handlePurchase} disabled={loading} className="btn-primary">
          {loading ? t('personal.membership.subscribing', 'Subscribing...') : t('personal.membership.subscribe', 'Subscribe Now')}
        </button>
        {msg && <div className={`mt-2 text-xs ${msg.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>{msg}</div>}
      </div>
    )
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadUserData()
  }, [isAuthenticated, router])

  const loadUserData = async () => {
    try {
      // Load user profile
      const profileResponse = await apiClient.getProfile()
      if (profileResponse.data) {
        setUser(profileResponse.data)
        setEditForm({
          first_name: profileResponse.data.first_name || '',
          last_name: profileResponse.data.last_name || '',
          phone: profileResponse.data.phone || '',
          bio: profileResponse.data.bio || ''
        })
      }

      // Load membership
      const membershipResponse = await apiClient.getMembership()
      if (membershipResponse.data) {
        setMembership(membershipResponse.data)
      }

      // Load user's items
      const itemsResponse = await apiClient.getItems({ my: true })
      if (itemsResponse.data?.results) {
        setItems(itemsResponse.data.results)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveMsg('')
    
    try {
      const response = await apiClient.updateProfile({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        phone: editForm.phone,
        bio: editForm.bio
      })
      
      if (response.data) {
        setUser({ ...user, ...response.data })
        setSaveMsg(t('personal.saved', 'Saved successfully'))
        setTimeout(() => setSaveMsg(''), 3000)
      } else {
        setSaveMsg(response.error || t('personal.saveFailed', 'Save failed'))
      }
    } catch (error) {
      setSaveMsg(t('personal.saveFailed', 'Save failed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container-app py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1">
                <div className="h-64 bg-gray-200 rounded-lg"></div>
              </div>
              <div className="lg:col-span-3">
                <div className="h-96 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container-app py-8">
        {/* 用户信息卡片 */}
        <div className="card mb-8 hover-lift">
          <div className="card-body">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-2xl font-bold text-white shadow-medium">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.username}</h1>
                <p className="text-gray-600 text-lg mb-4">{user?.bio || t('personal.noBio', 'No bio yet')}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  {user?.date_joined && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-brand-500 rounded-full"></div>
                      <span>{t('personal.registerTime', 'Registered:')} {new Date(user.date_joined).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span>{t('personal.email', 'Email:')} {user?.ait_email || user?.email}</span>
                  </div>
                  {user?.phone && (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span>{t('personal.phone', 'Phone:')} {user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-600 mb-1">{items.length}</div>
                <div className="text-sm text-gray-500">{t('personal.postItems', 'Posted Items')}</div>
                <div className="mt-2">
                  <a href="/items/new" className="btn-primary text-sm">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('personal.postNew', 'Post New Item')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Card */}
        <div className="card mb-8 hover-lift bg-gradient-to-br from-amber-50 to-pink-50 dark:from-amber-900/20 dark:to-pink-900/20 border-2 border-amber-200 dark:border-amber-800">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center shadow-medium">
                  <Star className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('personal.membership', 'Membership')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">199 {t('item.priceSymbol', 'THB')}/{t('common.month', 'month')} · {t('home.membership.feature', 'Feature your items')}</p>
                </div>
              </div>
              <MembershipSection />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-1">
            <div className="card hover-lift">
              <div className="card-body p-0">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium rounded-lg transition-all duration-200 group ${
                      activeTab === 'profile'
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100 text-brand-600 border-r-2 border-brand-600 shadow-soft'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600'
                    }`}>
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t('personal.profile', 'Profile')}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('items')}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium rounded-lg transition-all duration-200 group ${
                      activeTab === 'items'
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100 text-brand-600 border-r-2 border-brand-600 shadow-soft'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === 'items'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600'
                    }`}>
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t('personal.items', 'My Items')}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium rounded-lg transition-all duration-200 group ${
                      activeTab === 'orders'
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100 text-brand-600 border-r-2 border-brand-600 shadow-soft'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600'
                    }`}>
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t('personal.orders', 'My Orders')}</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('favorites')}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left text-sm font-medium rounded-lg transition-all duration-200 group ${
                      activeTab === 'favorites'
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100 text-brand-600 border-r-2 border-brand-600 shadow-soft'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                    }`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${
                      activeTab === 'favorites'
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-brand-100 group-hover:text-brand-600'
                    }`}>
                      <Heart className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{t('personal.favorites', 'My Favorites')}</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card mt-6 hover-lift">
              <div className="card-body">
                <h3 className="font-semibold text-gray-900 mb-4">{t('personal.quickActions', 'Quick Actions')}</h3>
                <div className="space-y-3">
                  <a href="/items/new" className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                      <Plus className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600">{t('personal.postNew', 'Post New Item')}</span>
                  </a>
                  <a href="/search" className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Eye className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600">{t('personal.browse', 'Browse Items')}</span>
                  </a>
                  <a href="/chat" className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-50 transition-colors group">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600">{t('personal.messages', 'Messages')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="card hover-lift">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('personal.profile', 'Profile')}</h2>
                  </div>
                  <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.username', 'Username')}</label>
                        <input
                          type="text"
                          value={user?.username || ''}
                          disabled
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">{t('personal.usernameReadOnly', 'Username cannot be modified')}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.emailLabel', 'Email')}</label>
                        <input
                          type="email"
                          value={user?.ait_email || user?.email || ''}
                          disabled
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-xs text-gray-500">{t('personal.emailReadOnly', 'Email cannot be modified')}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.firstName', 'First Name')}</label>
                        <input
                          type="text"
                          value={editForm.first_name}
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.lastName', 'Last Name')}</label>
                        <input
                          type="text"
                          value={editForm.last_name}
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.phoneLabel', 'Phone')}</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder={t('personal.phonePlaceholder', 'Enter phone number')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.bio', 'Bio')}</label>
                      <textarea
                        rows={4}
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder={t('personal.bioPlaceholder', 'Tell us about yourself...')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div className="flex justify-end items-center gap-4">
                      {saveMsg && (
                        <span className={`text-sm ${saveMsg.includes(t('personal.saved', 'Saved successfully')) || saveMsg.includes('成功') || saveMsg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                          {saveMsg}
                        </span>
                      )}
                      <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? t('personal.saving', 'Saving...') : t('personal.save', 'Save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('personal.items', 'My Items')}</h2>
                  </div>
                  <a href="/items/new" className="btn-primary">
                    <Plus className="h-4 w-4 mr-1" />
                    {t('empty.postItem', 'Post an item')}
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <div key={item.id} className="card hover-lift group">
                      <div className="relative overflow-hidden rounded-t-2xl">
                        {(item.image_urls && item.image_urls.length > 0) || item.image_url ? (
                          <img 
                            src={item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : item.image_url} 
                            alt={item.title} 
                            className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                          />
                        ) : (
                          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="text-center">
                              <div className="h-16 w-16 mx-auto mb-2 rounded-2xl bg-gray-300 flex items-center justify-center">
                                <Package className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-sm text-gray-500">{t('empty.noItems', 'No items yet')}</p>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            item.is_available ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                          }`}>
                            {item.is_available ? t('personal.itemStatus.available', 'Available') : t('personal.itemStatus.sold', 'Sold')}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <h3 className="line-clamp-1 font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">{item.title}</h3>
                        <p className="line-clamp-2 text-sm text-gray-600 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="font-bold text-brand-600 text-lg">
                            {item.price ? `${item.price} ${t('item.priceSymbol', 'THB')}` : t('personal.priceNegotiable', 'Negotiable')}
                          </span>
                          <div className="text-xs text-gray-500">
                            {new Date(item.created_at).toLocaleDateString('zh-CN')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-2 text-sm text-brand-600 hover:text-brand-700 py-2 px-3 rounded-lg hover:bg-brand-50 transition-colors">
                            <Edit className="h-4 w-4" />
                            {t('personal.edit', 'Edit')}
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 className="h-4 w-4" />
                            {t('personal.delete', 'Delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="card hover-lift">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('personal.orders', 'My Orders')}</h2>
                  </div>
                  <div className="text-center py-16 text-gray-500">
                    <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <ShoppingCart className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('personal.noOrders', 'No orders yet')}</h3>
                    <p className="text-sm text-gray-500 mb-6">{t('personal.noOrdersDesc', 'You don\'t have any orders yet. Go shopping now!')}</p>
                    <a href="/" className="btn-primary">
                      {t('personal.goShopping', 'Go Shopping')}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="card hover-lift">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('personal.favorites', 'My Favorites')}</h2>
                  </div>
                  <div className="text-center py-16 text-gray-500">
                    <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                      <Heart className="h-10 w-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('personal.noFavorites', 'No favorites yet')}</h3>
                    <p className="text-sm text-gray-500 mb-6">{t('personal.noFavoritesDesc', 'Favorite items you like for easy access')}</p>
                    <a href="/" className="btn-primary">
                      {t('personal.goShopping', 'Go Shopping')}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}