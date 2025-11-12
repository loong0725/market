'use client'

import { useEffect, useState } from 'react'
import { Star, Package, Heart, Eye } from 'lucide-react'
import { useI18n } from '../../components/I18nProviderClient'
import { apiClient } from '../../lib/api'
import Link from 'next/link'

type Item = {
  id: number
  title: string
  description?: string
  price?: number
  image_url?: string
  image_urls?: string[]
  owner_username?: string
  created_at?: string
  is_featured?: boolean
}

export default function FeaturedPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedItems()
  }, [])

  const loadFeaturedItems = async () => {
    try {
      const response = await apiClient.getItems({ featured: 'true' })
      if (response.data) {
        // Handle both paginated and non-paginated responses
        let items: Item[] = []
        if (Array.isArray(response.data)) {
          items = response.data
        } else if (response.data.results && Array.isArray(response.data.results)) {
          items = response.data.results
        } else if (Array.isArray(response.data)) {
          items = response.data
        }
        setItems(items)
      }
    } catch (error) {
      console.error('Failed to load featured items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container-app py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center shadow-medium">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">{t('featured.title', 'Featured Items')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t('featured.subtitle', 'High-quality featured items from members')}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card">
                <div className="h-48 skeleton rounded-t-2xl" />
                <div className="card-body space-y-3">
                  <div className="h-5 skeleton" />
                  <div className="h-4 skeleton w-2/3" />
                  <div className="h-6 skeleton w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link key={item.id} href={`/items/${item.id}`} className="card group overflow-hidden hover-lift">
                <div className="relative">
                  {(item.image_urls && item.image_urls.length > 0) || item.image_url ? (
                    <img
                      src={item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : item.image_url}
                      alt={item.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      <Package className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <div className="bg-gradient-to-r from-amber-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {t('home.allItems.featured', 'Featured')}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                    {item.description || '—'}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400">
                      {item.price != null ? `${item.price} ${t('item.priceSymbol', 'THB')}` : t('list.priceNegotiable', 'Negotiable')}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t('list.seller', 'Seller:')}{item.owner_username ?? '—'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 text-white flex items-center justify-center shadow-medium mb-4">
                <Star className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-semibold">{t('featured.noItems', 'No featured items yet')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('featured.noItemsDesc', 'Become a member to feature your items here')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

