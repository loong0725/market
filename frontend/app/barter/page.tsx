'use client'

import { useEffect, useState } from 'react'
import { Package, RefreshCw } from 'lucide-react'
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
  desired_item?: string
  is_barter?: boolean
  allow_barter?: boolean
}

export default function BarterPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBarterItems()
  }, [])

  const loadBarterItems = async () => {
    try {
      // Use API filter to get both is_barter=True and allow_barter=True items
      const response = await apiClient.getItems({ is_barter: true })
      // Handle both paginated and non-paginated responses
      const items = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || response.data || [])
      setItems(items)
    } catch (error) {
      console.error('Failed to load barter items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container-app py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 text-white flex items-center justify-center shadow-medium">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">{t('barter.title', 'Barter')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t('barter.subtitle', 'No cash needed — swap what you have for what you need')}</p>
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
                  <div className="absolute top-3 left-3">
                    {item.is_barter ? (
                      <div className="bg-cyan-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {t('home.barter.barterOnly', 'Barter')}
                      </div>
                    ) : item.allow_barter ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {t('barter.acceptsBarter', 'Accepts Barter')}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="card-body">
                  <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                  {item.desired_item && (
                    <div className="mt-2 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">{t('barter.wantToSwap', 'Want to swap:')}</p>
                      <p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">{item.desired_item}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-2">
                    {item.description || '—'}
                  </p>
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    {t('barter.publisher', 'Publisher:')}{item.owner_username ?? '—'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-600 text-white flex items-center justify-center shadow-medium mb-4">
                <RefreshCw className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-semibold">{t('barter.noItems', 'No barter items yet')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('barter.noItemsDesc', 'Select "Barter" when posting to participate in swaps')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

