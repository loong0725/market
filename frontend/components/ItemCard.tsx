'use client'

import Link from 'next/link'
import { Package, Heart, Eye } from 'lucide-react'
import { useI18n } from './I18nProviderClient'

type ItemCardProps = {
  item: {
    id: number
    title: string
    description?: string
    price?: number
    image_url?: string
    owner_username?: string
    created_at?: string
    likes?: number
    views?: number
  }
  showActions?: boolean
  onAddToWishlist?: () => void
  onAddToCart?: () => void
}

export default function ItemCard({ item, showActions = false, onAddToWishlist, onAddToCart }: ItemCardProps) {
  const { t } = useI18n()

  return (
    <article className="card group overflow-hidden hover-lift">
      <div className="relative">
        <Link href={`/items/${item.id}`}>
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-48 w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
              <Package className="h-12 w-12 text-slate-400" />
            </div>
          )}
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {showActions && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href={`/items/${item.id}`} className="btn-primary px-3 py-1.5 text-sm">
              {t('list.viewDetail', '查看详情')}
            </Link>
          </div>
        )}
      </div>

      <div className="card-body">
        <Link href={`/items/${item.id}`}>
          <h3 className="font-semibold line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400">
            {item.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
          {item.description || '—'}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-cyan-400">
            {item.price != null ? `¥${item.price}` : t('list.priceNegotiable', '面议')}
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" /> {item.views ?? 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" /> {item.likes ?? 0}
            </span>
          </div>
        </div>

        {item.owner_username && (
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {t('list.seller', '卖家：')}{item.owner_username}
          </div>
        )}

        {showActions && (onAddToCart || onAddToWishlist) && (
          <div className="mt-3 flex gap-2">
            {onAddToCart && (
              <button onClick={onAddToCart} className="btn-primary flex-1 text-sm">
                {t('cart.add', 'เพิ่มลงตะกร้า')}
              </button>
            )}
            {onAddToWishlist && (
              <button onClick={onAddToWishlist} className="btn-outline text-sm px-3">
                <Heart className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

