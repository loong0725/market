'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, Send, User, LogOut, Heart, ShoppingCart } from 'lucide-react'
import { useI18n } from './I18nProviderClient'
import { useAuth } from './AuthProvider'
import LanguageButton from './LanguageButton'
import { useState, useRef, useEffect } from 'react'

export default function Header() {
  const { t } = useI18n()
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 dark:border-white/10 backdrop-blur-xl bg-white/60 dark:bg-slate-900/60">
      <div className="container-app py-3 flex items-center gap-3">
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center shadow-soft">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('title')}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">
              {t('subtitle')}
            </div>
          </div>
        </Link>

        {/* 搜索框 */}
        <div className="flex-1 max-w-2xl ml-2 hidden md:block">
          <label className="relative block">
            <span className="absolute left-3 top-2.5 text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-white/60 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 shadow-soft placeholder:text-slate-400"
              placeholder={t('searchPlaceholder')}
            />
          </label>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link href="/cart" className="btn-ghost relative">
                <ShoppingCart className="h-4 w-4" />
              </Link>
              <Link href="/wishlist" className="btn-ghost">
                <Heart className="h-4 w-4" />
              </Link>
              <Link href="/items/new" className="btn-primary">
                <Send className="h-4 w-4 mr-1" /> {t('post')}
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="btn-ghost flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.username || user?.first_name || 'User'}</span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-50">
                    <Link
                      href="/personal"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setShowMenu(false)}
                    >
                      {t('header.profile', '个人信息')}
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setShowMenu(false)}
                    >
                      {t('header.orders', '我的订单')}
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4 inline mr-2" />
                      {t('header.logout', '登出')}
                    </button>
                  </div>
                )}
              </div>
              <LanguageButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline">{t('login')}</Link>
              <Link href="/register" className="btn-outline">{t('register')}</Link>
              <Link href="/items/new" className="btn-primary">
                <Send className="h-4 w-4 mr-1" /> {t('post')}
              </Link>
              <LanguageButton />
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
