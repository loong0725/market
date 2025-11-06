'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../components/I18nProviderClient'
import ProtectedRoute from '../../components/ProtectedRoute'
import { Heart, Package, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

type WishlistItem = {
  id: number
  item: {
    id: number
    title: string
    description?: string
    price?: number
    image_url?: string
    image_urls?: string[]
    owner_username?: string
  }
  added_at: string
  notes?: string
}

function WishlistPageContent() {
  const router = useRouter()
  const { t } = useI18n()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('access')
      const res = await fetch(`${API}/wishlist/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        // Handle both array and object with items property
        const itemsArray = Array.isArray(data) ? data : (data.items || [])
        setItems(itemsArray)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      const token = localStorage.getItem('access')
      const res = await fetch(`${API}/wishlist/item/${itemId}/remove/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        fetchWishlist()
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="container-app mt-8">
        <div className="card">
          <div className="card-body">
            <div className="h-64 skeleton rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app mt-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-pink-500" />
          {t('wishlist.title', 'รายการโปรด')}
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-16">
            <Heart className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('wishlist.empty', 'ยังไม่มีรายการโปรด')}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{t('wishlist.emptyDesc', 'เพิ่มสินค้าที่ชอบลงรายการโปรด')}</p>
            <Link href="/" className="btn-primary">{t('wishlist.browse', 'ไปเลือกสินค้า')}</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((wishlistItem) => (
            <div key={wishlistItem.id} className="card group overflow-hidden hover-lift">
              <div className="relative">
                <Link href={`/items/${wishlistItem.item.id}`}>
                  {(wishlistItem.item.image_urls && wishlistItem.item.image_urls.length > 0) || wishlistItem.item.image_url ? (
                    <img
                      src={wishlistItem.item.image_urls && wishlistItem.item.image_urls.length > 0 ? wishlistItem.item.image_urls[0] : wishlistItem.item.image_url}
                      alt={wishlistItem.item.title}
                      className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-48 w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                      <Package className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                </Link>

                <button
                  onClick={() => removeItem(wishlistItem.item.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="card-body">
                <Link href={`/items/${wishlistItem.item.id}`}>
                  <h3 className="font-semibold line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400">
                    {wishlistItem.item.title}
                  </h3>
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                  {wishlistItem.item.description || '—'}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {wishlistItem.item.price != null ? `¥${wishlistItem.item.price}` : t('item.negotiable', '面议')}
                  </div>
                  
                  <Link
                    href={`/items/${wishlistItem.item.id}`}
                    className="btn-outline text-sm px-3 py-1.5 flex items-center gap-1"
                  >
                    <Eye className="h-3 w-3" />
                    {t('wishlist.view', 'ดูรายละเอียด')}
                  </Link>
                </div>

                {wishlistItem.item.owner_username && (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {t('item.seller', 'ผู้ขาย')}: {wishlistItem.item.owner_username}
                  </div>
                )}

                {wishlistItem.notes && (
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 italic">
                    {t('wishlist.notes', 'หมายเหตุ')}: {wishlistItem.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistPageContent />
    </ProtectedRoute>
  )
}

