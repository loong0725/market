'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useI18n } from '../../components/I18nProviderClient'
import { Search, Filter, Package } from 'lucide-react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

type Item = {
  id: number
  title: string
  description?: string
  price?: number
  image_url?: string
  image_urls?: string[]
  owner_username?: string
  created_at?: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { t } = useI18n()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  const searchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.append('q', query)
      if (category) params.append('category', category)
      if (minPrice) params.append('min_price', minPrice)
      if (maxPrice) params.append('max_price', maxPrice)

      const res = await fetch(`${API}/search/items/?${params.toString()}`)
      const data = await res.json()
      setItems(Array.isArray(data?.results || data) ? (data.results || data) : [])
    } catch (err) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchParams.get('q')) {
      searchItems()
    }
  }, [searchParams])

  return (
    <div className="container-app mt-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t('search.filters', 'Filters')}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('search.category', 'Category')}</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder={t('search.categoryPlaceholder', 'Select category')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t('search.minPrice', 'Min Price')}</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">{t('search.maxPrice', 'Max Price')}</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="9999"
                  />
                </div>
                
                <button onClick={searchItems} className="btn-primary w-full">
                  {t('search.apply', 'Apply Filters')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchItems()}
                className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder={t('search.placeholder', 'Search items...')}
              />
            </div>
            <button onClick={searchItems} className="btn-primary mt-3 w-full">
              {t('search.search', 'Search')}
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="h-44 skeleton rounded-t-2xl" />
                  <div className="card-body space-y-3">
                    <div className="h-5 skeleton" />
                    <div className="h-4 skeleton w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-16">
                <div className="text-slate-400 dark:text-slate-500">
                  {t('search.noResults', 'No results found')}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="card hover-lift">
                  {(item.image_urls && item.image_urls.length > 0) || item.image_url ? (
                    <img
                      src={item.image_urls && item.image_urls.length > 0 ? item.image_urls[0] : item.image_url}
                      alt={item.title}
                      className="h-48 w-full object-cover rounded-t-2xl"
                    />
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center rounded-t-2xl">
                      <Package className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  <div className="card-body">
                    <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                      {item.description || '—'}
                    </p>
                    <div className="mt-4 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {item.price != null ? `${item.price} ${t('item.priceSymbol', 'THB')}` : t('item.negotiable', 'Negotiable')}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

