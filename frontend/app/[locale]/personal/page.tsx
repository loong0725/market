'use client'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { User, Package, ShoppingCart, Heart, Settings, Plus, Search, MessageCircle, Eye, Heart as HeartIcon } from 'lucide-react'
import LanguageSwitcher from '../../../components/LanguageSwitcher'

type User = {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar?: string
  phone?: string
  bio?: string
  created_at: string
}

type Item = {
  id: number
  title: string
  description?: string
  price?: number
  image_url?: string
  status: 'active' | 'sold' | 'draft'
  created_at: string
  views?: number
  likes?: number
}

export default function PersonalPage() {
  const [user, setUser] = useState<User | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [activeTab, setActiveTab] = useState<'profile' | 'items' | 'orders' | 'favorites'>('profile')
  const [loading, setLoading] = useState(true)
  const t = useTranslations()

  useEffect(() => {
    // 模拟获取用户信息
    setUser({
      id: 1,
      username: '张同学',
      email: 'zhang@ait.asia',
      first_name: '张',
      last_name: '同学',
      avatar: '',
      phone: '138****8888',
      bio: 'AIT 计算机科学专业学生，喜欢数码产品',
      created_at: '2024-01-15'
    })

    // 模拟获取用户商品
    setItems([
      {
        id: 1,
        title: 'iPhone 13 Pro 128GB',
        description: '九成新，无磕碰，原装充电器',
        price: 4500,
        image_url: '',
        status: 'active',
        created_at: '2024-01-20',
        views: 156,
        likes: 12
      },
      {
        id: 2,
        title: 'MacBook Air M1',
        description: '2020款，8GB+256GB，轻微使用痕迹',
        price: 6500,
        image_url: '',
        status: 'sold',
        created_at: '2024-01-18',
        views: 234,
        likes: 28
      },
      {
        id: 3,
        title: 'Nike Air Force 1',
        description: '白色经典款，42码，只穿过几次',
        price: 300,
        image_url: '',
        status: 'active',
        created_at: '2024-01-22',
        views: 89,
        likes: 5
      }
    ])

    setLoading(false)
  }, [])

  const tabs = [
    { id: 'profile', name: t('personal.profile'), icon: User },
    { id: 'items', name: t('personal.myItems'), icon: Package },
    { id: 'orders', name: t('personal.myOrders'), icon: ShoppingCart },
    { id: 'favorites', name: t('personal.myFavorites'), icon: Heart }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded-2xl"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-96 bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-soft">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white font-bold text-lg shadow-medium group-hover:scale-110 transition-transform duration-300">
                A
              </div>
              <div>
                <span className="text-xl font-bold gradient-text">AIT Marketplace</span>
                <p className="text-xs text-gray-500 -mt-1">Campus Trading Hub</p>
              </div>
            </a>
            
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <a href="/" className="px-4 py-2 text-gray-600 hover:text-brand-600 font-medium transition-colors">
                {t('common.home')}
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container-app py-8">
        {/* 用户信息卡片 */}
        <div className="card hover-lift mb-8 animate-fade-in">
          <div className="card-body">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-2xl font-bold text-white shadow-medium">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.username}</h1>
                <p className="text-gray-600 text-lg mb-4">{user?.bio || '暂无个人简介'}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span>注册时间: {user?.created_at}</span>
                  <span>邮箱: {user?.email}</span>
                  <span>手机: {user?.phone}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-brand-600">{items.length}</div>
                <div className="text-sm text-gray-500">{t('personal.itemsCount')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:col-span-1">
            <div className="card hover-lift">
              <div className="card-body p-0">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-4 text-left font-medium rounded-xl transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-brand-50 to-brand-100 text-brand-600 shadow-soft border-l-4 border-brand-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-brand-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="card hover-lift mt-6">
              <div className="card-body">
                <h3 className="font-bold text-gray-900 mb-4">{t('personal.quickActions')}</h3>
                <div className="space-y-3">
                  <a href="/items/new" className="flex items-center gap-3 text-sm text-brand-600 hover:text-brand-700 p-2 rounded-lg hover:bg-brand-50 transition-colors">
                    <Plus className="h-4 w-4" />
                    {t('personal.publishNew')}
                  </a>
                  <a href="/search" className="flex items-center gap-3 text-sm text-brand-600 hover:text-brand-700 p-2 rounded-lg hover:bg-brand-50 transition-colors">
                    <Search className="h-4 w-4" />
                    {t('personal.searchItems')}
                  </a>
                  <a href="/chat" className="flex items-center gap-3 text-sm text-brand-600 hover:text-brand-700 p-2 rounded-lg hover:bg-brand-50 transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    {t('personal.messageCenter')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* 主内容区域 */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="card hover-lift animate-fade-in">
                <div className="card-body">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('personal.editProfile')}</h2>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.username')}</label>
                        <input
                          type="text"
                          defaultValue={user?.username}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.email')}</label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.phone')}</label>
                        <input
                          type="tel"
                          defaultValue={user?.phone}
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.major')}</label>
                        <input
                          type="text"
                          placeholder="计算机科学"
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('personal.bio')}</label>
                      <textarea
                        rows={4}
                        defaultValue={user?.bio}
                        placeholder={t('personal.bioPlaceholder')}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button className="btn-gradient">
                        {t('common.save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'items' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{t('personal.myItems')}</h2>
                  <a href="/items/new" className="btn-gradient flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('personal.publishNew')}
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((item, index) => (
                    <div key={item.id} className="card hover-lift group animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="relative overflow-hidden rounded-t-2xl">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="flex h-48 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            item.status === 'active' ? 'bg-green-100 text-green-600' :
                            item.status === 'sold' ? 'bg-gray-100 text-gray-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {t(`personal.status.${item.status}`)}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <h3 className="line-clamp-1 font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                          {item.title}
                        </h3>
                        <p className="line-clamp-2 text-sm text-gray-600 mb-4">{item.description}</p>
                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="font-bold text-brand-600 text-lg">¥{item.price}</span>
                          <div className="flex items-center gap-3 text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{item.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <HeartIcon className="h-4 w-4" />
                              <span>{item.likes}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 text-sm text-brand-600 hover:text-brand-700 py-2 px-3 rounded-lg hover:bg-brand-50 transition-colors">
                            {t('common.edit')}
                          </button>
                          <button className="flex-1 text-sm text-red-600 hover:text-red-700 py-2 px-3 rounded-lg hover:bg-red-50 transition-colors">
                            {t('common.delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="card hover-lift animate-fade-in">
                <div className="card-body">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('personal.myOrders')}</h2>
                  <div className="text-center py-16 text-gray-500">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">{t('personal.noOrders')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="card hover-lift animate-fade-in">
                <div className="card-body">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('personal.myFavorites')}</h2>
                  <div className="text-center py-16 text-gray-500">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">{t('personal.noFavorites')}</p>
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
