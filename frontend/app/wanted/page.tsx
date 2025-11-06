'use client'

import { useEffect, useState } from 'react'
import { Search, Package, Plus } from 'lucide-react'
import { useI18n } from '../../components/I18nProviderClient'
import { apiClient } from '../../lib/api'
import { useAuth } from '../../components/AuthProvider'
import Link from 'next/link'

type WantedItem = {
  id: number
  title: string
  description?: string
  max_price?: number
  category?: string
  condition_preference?: string
  user_username?: string
  created_at?: string
  is_active?: boolean
}

export default function WantedPage() {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const [wantedItems, setWantedItems] = useState<WantedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWantedItems()
  }, [])

  const loadWantedItems = async () => {
    try {
      const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'
      const response = await fetch(`${API}/wanted/wanted/`)
      const data = await response.json()
      if (Array.isArray(data)) {
        setWantedItems(data)
      } else if (data.results) {
        setWantedItems(data.results)
      }
    } catch (error) {
      console.error('Failed to load wanted items:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container-app py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center shadow-medium">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">{t('wanted.title', 'Wanted Items')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{t('wanted.subtitle', 'Post what you need and let sellers contact you')}</p>
            </div>
          </div>
          {isAuthenticated && (
            <Link href="/wanted/new" className="btn-primary">
              <Plus className="h-4 w-4 mr-1" />
              {t('wanted.postWanted', 'Post Wanted')}
            </Link>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card">
                <div className="card-body">
                  <div className="h-6 skeleton w-2/3 mb-2" />
                  <div className="h-4 skeleton w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : wantedItems.length > 0 ? (
          <div className="space-y-4">
            {wantedItems.map((item) => (
              <div key={item.id} className="card hover-lift">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{item.title}</h3>
                        {item.max_price && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                            {t('wanted.maxPrice', 'Max Price:')} ¥{item.max_price}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-3">{item.description || '—'}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.category && <span>{t('wanted.category', 'Category:')}{item.category}</span>}
                        {item.condition_preference && <span>{t('wanted.condition', 'Condition Preference:')}{item.condition_preference}</span>}
                        <span>{t('barter.publisher', 'Publisher:')}{item.user_username}</span>
                        {item.created_at && (
                          <span>{new Date(item.created_at).toLocaleDateString('zh-CN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <div className="card-body text-center py-16">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center shadow-medium mb-4">
                <Search className="h-9 w-9" />
              </div>
              <h3 className="text-lg font-semibold">{t('wanted.noItems', 'No wanted items yet')}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('wanted.noItemsDesc', 'Post your wanted items and let sellers contact you')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

