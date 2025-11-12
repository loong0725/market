'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../components/I18nProviderClient'
import ProtectedRoute from '../../components/ProtectedRoute'
import { Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'

type Order = {
  id: number
  item: {
    id: number
    title: string
    image_url?: string
    image_urls?: string[]
  }
  quantity: number
  total_price: number
  status: string
  payment_status: string
  created_at: string
  shipping_address?: string
}

function OrdersPageContent() {
  const router = useRouter()
  const { t } = useI18n()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('access')
      const res = await fetch(`${API}/orders/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-amber-600" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: t('order.status.pending', 'Pending'),
      confirmed: t('order.status.confirmed', 'Confirmed'),
      shipped: t('order.status.shipped', 'Shipped'),
      delivered: t('order.status.delivered', 'Delivered'),
      cancelled: t('order.status.cancelled', 'Cancelled'),
    }
    return statusMap[status] || status
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
      <h1 className="text-2xl font-bold mb-6">{t('orders.title', 'My Orders')}</h1>

      {orders.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-16">
            <Package className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('orders.empty', 'No orders yet')}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{t('orders.emptyDesc', 'Start shopping now!')}</p>
            <Link href="/" className="btn-primary">{t('orders.browse', 'Browse Items')}</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="card-body">
                <div className="flex gap-4">
                  <Link href={`/items/${order.item.id}`}>
                    {(order.item.image_urls && order.item.image_urls.length > 0) || order.item.image_url ? (
                      <img
                        src={order.item.image_urls && order.item.image_urls.length > 0 ? order.item.image_urls[0] : order.item.image_url}
                        alt={order.item.title}
                        className="h-24 w-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="h-24 w-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center">
                        <Package className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link href={`/items/${order.item.id}`}>
                          <h3 className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400">
                            {order.item.title}
                          </h3>
                        </Link>
                        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                          {t('orders.quantity', 'Quantity')}: {order.quantity} {t('orders.pieces', 'pieces')}
                        </div>
                        {order.shipping_address && (
                          <div className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                            {t('orders.address', 'Shipping Address')}: {order.shipping_address}
                          </div>
                        )}
                        <div className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                          {t('orders.date', 'Order Date')}: {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          {getStatusIcon(order.status)}
                          <span className="font-medium">{getStatusText(order.status)}</span>
                        </div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {order.total_price} {t('item.priceSymbol', 'THB')}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {t('orders.payment', 'Payment')}: {order.payment_status === 'paid' ? t('orders.paid', 'Paid') : t('orders.unpaid', 'Unpaid')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersPageContent />
    </ProtectedRoute>
  )
}

