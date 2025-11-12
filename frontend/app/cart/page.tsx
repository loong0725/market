'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../components/I18nProviderClient'
import ProtectedRoute from '../../components/ProtectedRoute'
import { ShoppingCart, Trash2, Plus, Minus, Package } from 'lucide-react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

type CartItem = {
  id: number
  item: {
    id: number
    title: string
    price?: number
    image_url?: string
    image_urls?: string[]
  }
  quantity: number
}

type Cart = {
  id: number
  items: CartItem[]
  total_price: number
  total_items: number
}

function CartPageContent() {
  const router = useRouter()
  const { t } = useI18n()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('access')
      const res = await fetch(`${API}/cart/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return
    try {
      const token = localStorage.getItem('access')
      const res = await fetch(`${API}/cart/item/${itemId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      })
      if (res.ok) {
        fetchCart()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const removeItem = async (itemId: number) => {
    try {
      const token = localStorage.getItem('access')
      const res = await fetch(`${API}/cart/item/${itemId}/remove/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        fetchCart()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const checkout = () => {
    router.push('/orders/new')
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-app mt-8">
        <div className="card">
          <div className="card-body text-center py-16">
            <ShoppingCart className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('cart.empty', 'Cart is empty')}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{t('cart.emptyDesc', 'Add items to your cart first')}</p>
            <Link href="/" className="btn-primary">{t('cart.browse', 'Browse Items')}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app mt-8">
      <h1 className="text-2xl font-bold mb-6">{t('cart.title', 'Shopping Cart')}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((cartItem) => (
            <div key={cartItem.id} className="card">
              <div className="card-body">
                <div className="flex gap-4">
                  <Link href={`/items/${cartItem.item.id}`}>
                    {(cartItem.item.image_urls && cartItem.item.image_urls.length > 0) || cartItem.item.image_url ? (
                      <img
                        src={cartItem.item.image_urls && cartItem.item.image_urls.length > 0 ? cartItem.item.image_urls[0] : cartItem.item.image_url}
                        alt={cartItem.item.title}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </Link>
                  
                  <div className="flex-1">
                    <Link href={`/items/${cartItem.item.id}`}>
                      <h3 className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400">
                        {cartItem.item.title}
                      </h3>
                    </Link>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {cartItem.item.price ? `${cartItem.item.price} ${t('item.priceSymbol', 'THB')}` : t('item.negotiable', 'Negotiable')}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => removeItem(cartItem.item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {t('cart.subtotal', 'Subtotal')}: {cartItem.item.price ? cartItem.item.price * cartItem.quantity : 0} {t('item.priceSymbol', 'THB')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <div className="card-body">
              <h3 className="font-semibold mb-4">{t('cart.summary', 'Order Summary')}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>{t('cart.items', 'Items')}</span>
                  <span>{cart.total_items} {t('cart.pieces', 'pieces')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>{t('cart.total', 'Total')}</span>
                  <span>{cart.total_price} {t('item.priceSymbol', 'THB')}</span>
                </div>
              </div>

              <button onClick={checkout} className="btn-primary w-full">
                {t('cart.checkout', 'Checkout')}
              </button>
              
              <Link href="/" className="btn-outline w-full mt-3 block text-center">
                {t('cart.continue', 'Continue Shopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartPageContent />
    </ProtectedRoute>
  )
}

