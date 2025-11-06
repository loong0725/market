'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { useI18n } from '../components/I18nProviderClient'
import { apiClient } from '../lib/api'
import Link from 'next/link'

interface Item {
  id: number
  title: string
  price: number | null
  image_url?: string
  image_urls?: string[]
  owner: {
    username: string
  }
  owner_username?: string
  is_available: boolean
  is_featured?: boolean
  is_barter?: boolean
  created_at: string
}

interface Membership {
  is_valid: boolean
  end_date?: string
}

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const router = useRouter()
  
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [latestProducts, setLatestProducts] = useState<Item[]>([])
  const [featuredItems, setFeaturedItems] = useState<Item[]>([])
  const [barterItems, setBarterItems] = useState<Item[]>([])
  const [allItems, setAllItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load membership if authenticated
      if (isAuthenticated && user) {
        try {
          const membershipRes = await apiClient.getMembership()
          if (membershipRes.data) {
            setMembership(membershipRes.data)
          }
        } catch (err) {
          // No membership or error
        }
      }

      // Load latest products (featured items from members)
      try {
        const latestRes = await apiClient.getItems({ featured: 'true', limit: 5 })
        if (latestRes.data) {
          setLatestProducts(latestRes.data.results || latestRes.data)
        }
      } catch (err) {
        console.error('Error loading latest products:', err)
      }

      // Load featured items
      try {
        const featuredRes = await apiClient.getItems({ featured: 'true', limit: 4 })
        if (featuredRes.data) {
          setFeaturedItems(featuredRes.data.results || featuredRes.data)
        }
      } catch (err) {
        console.error('Error loading featured items:', err)
      }

      // Load barter items
      try {
        const barterRes = await apiClient.getItems({ is_barter: 'true', limit: 4 })
        if (barterRes.data) {
          setBarterItems(barterRes.data.results || barterRes.data)
        }
      } catch (err) {
        console.error('Error loading barter items:', err)
      }

      // Load all items
      try {
        const allRes = await apiClient.getItems({ limit: 20 })
        if (allRes.data) {
          // Handle both paginated and non-paginated responses
          const items = Array.isArray(allRes.data) 
            ? allRes.data 
            : (allRes.data.results || allRes.data)
          setAllItems(items)
        }
      } catch (err) {
        console.error('Error loading all items:', err)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const getItemImage = (item: Item) => {
    if (item.image_urls && item.image_urls.length > 0) {
      return item.image_urls[0]
    }
    if (item.image_url) {
      return item.image_url
    }
    // Use a placeholder service if no image
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.title)}`
  }

  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) {
      return t('home.allItems.priceNegotiable', 'Negotiable')
    }
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('home.loading', 'Loading...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Carousel Section */}
      <div className="relative w-full h-[400px] mb-8 overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
        >
          {/* Membership Card */}
          <div className="min-w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-700 p-8">
            <div className="text-center text-white max-w-2xl">
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-3xl font-bold mb-4">{t('home.membership.title', 'Membership Benefits')}</h2>
              {membership?.is_valid ? (
                <div>
                  <p className="text-xl mb-2">{t('home.membership.active', 'Your membership is active!')}</p>
                  {membership.end_date && (
                    <p className="text-lg opacity-90">
                      {t('home.membership.validUntil', 'Valid until:')} {new Date(membership.end_date).toLocaleDateString()}
                    </p>
                  )}
                  <Link 
                    href="/personal" 
                    className="mt-6 inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    {t('home.membership.manage', 'Manage Membership')}
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-xl mb-4">{t('home.membership.unlock', 'Unlock exclusive features with membership!')}</p>
                  <ul className="text-left mb-6 space-y-2 max-w-md mx-auto">
                    <li>{t('home.membership.feature', '✨ Feature your items')}</li>
                    <li>{t('home.membership.priority', '📈 Priority listing')}</li>
                    <li>{t('home.membership.promotions', '🎁 Special promotions')}</li>
                  </ul>
                  <Link 
                    href="/personal" 
                    className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    {t('home.membership.getStarted', 'Get Started - 199 THB/month')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Event Card */}
          <div className="min-w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-600 p-8">
            <div className="text-center text-white max-w-2xl">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-4">{t('home.event.title', 'Upcoming Events')}</h2>
              <p className="text-xl mb-6">{t('home.event.stayTuned', 'Stay tuned for exciting marketplace events!')}</p>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-2">{t('home.event.marketDay', 'Monthly Market Day')}</h3>
                <p className="mb-4">{t('home.event.marketDayDesc', 'Join us for special deals and community meetups')}</p>
                <p className="text-sm opacity-90">{t('home.event.comingSoon', 'Coming soon...')}</p>
              </div>
            </div>
          </div>

          {/* Latest Products Card */}
          <div className="min-w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 p-8">
            <div className="text-center text-white max-w-2xl w-full">
              <div className="text-6xl mb-4">🆕</div>
              <h2 className="text-3xl font-bold mb-6">{t('home.latest.title', 'Latest Products from Members')}</h2>
              {latestProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  {latestProducts.slice(0, 3).map((item) => (
                    <Link 
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="bg-white/20 backdrop-blur-sm rounded-lg p-4 hover:bg-white/30 transition"
                    >
                      <img 
                        src={getItemImage(item)} 
                        alt={item.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <p className="text-sm font-semibold truncate">{item.title}</p>
                      <p className="text-xs opacity-90">{formatPrice(item.price)}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xl">{t('home.latest.noProducts', 'No featured products yet')}</p>
              )}
              <Link 
                href="/featured" 
                className="mt-6 inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                {t('home.latest.viewAll', 'View All Featured')}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCarouselIndex(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === carouselIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCarouselIndex((prev) => (prev - 1 + 3) % 3)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
        >
          ←
        </button>
        <button
          onClick={() => setCarouselIndex((prev) => (prev + 1) % 3)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition"
        >
          →
        </button>
      </div>

      {/* Featured & Barter Cards Section */}
      <div className="container mx-auto px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Featured Items Card */}
          <Link href="/featured" className="group">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{t('home.featured.title', '⭐ Featured Items')}</h2>
                <span className="text-white text-sm">{t('home.featured.viewAll', 'View All →')}</span>
              </div>
              {featuredItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {featuredItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <img 
                        src={getItemImage(item)} 
                        alt={item.title}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                      <p className="text-white text-xs opacity-90">{formatPrice(item.price)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/80">{t('home.featured.noItems', 'No featured items yet')}</p>
              )}
            </div>
          </Link>

          {/* Barter Items Card */}
          <Link href="/barter" className="group">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{t('home.barter.title', '🔄 Barter')}</h2>
                <span className="text-white text-sm">{t('home.featured.viewAll', 'View All →')}</span>
              </div>
              {barterItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {barterItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <img 
                        src={getItemImage(item)} 
                        alt={item.title}
                        className="w-full h-20 object-cover rounded mb-2"
                      />
                      <p className="text-white text-sm font-semibold truncate">{item.title}</p>
                      <p className="text-white text-xs opacity-90">{t('home.barter.barterOnly', 'Barter Only')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/80">{t('home.barter.noItems', 'No barter items yet')}</p>
              )}
            </div>
          </Link>
        </div>
      </div>

      {/* All Items Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{t('home.allItems.title', 'All Items')}</h2>
          <Link 
            href="/items" 
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('home.allItems.viewAll', 'View All →')}
          </Link>
        </div>

        {allItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {allItems.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
                  <img
                    src={getItemImage(item)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold">
                      {t('home.allItems.featured', '⭐ Featured')}
                    </div>
                  )}
                  {item.is_barter && (
                    <div className="absolute top-2 left-2 bg-green-400 text-green-900 px-2 py-1 rounded text-xs font-semibold">
                      {t('home.allItems.barter', '🔄 Barter')}
                    </div>
                  )}
                  {!item.is_available && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">{t('home.allItems.soldOut', 'Sold Out')}</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">
                    {formatPrice(item.price)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('home.allItems.by', 'by')} {item.owner?.username || item.owner_username || 'Unknown'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t('home.allItems.noItems', 'No items available yet')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
