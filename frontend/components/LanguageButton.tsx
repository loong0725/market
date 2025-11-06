'use client'

import { useState, useRef, useEffect } from 'react'
import { useI18n } from './I18nProviderClient'
import { Globe } from 'lucide-react'

export default function LanguageButton() {
  const { lang, changeLang } = useI18n()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const languages = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'zh', flag: '🇨🇳', label: '中文' },
    { code: 'th', flag: '🇹🇭', label: 'ไทย' },
  ]

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      {/* 主按钮 */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-ghost flex items-center gap-1 text-sm"
      >
        <Globe className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
        <span>{languages.find((l) => l.code === lang)?.flag}</span>
      </button>

      {/* 下拉菜单 */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-36 card shadow-medium animate-in fade-in slide-in-from-top-1"
          style={{ zIndex: 50 }}
        >
          <div className="py-2 text-sm">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  changeLang(l.code as any)
                  setOpen(false)
                }}
                className={`w-full text-left px-3 py-2 flex items-center gap-2 transition ${
                  lang === l.code
                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-medium'
                    : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="text-lg">{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
