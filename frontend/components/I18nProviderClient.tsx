'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import en from '../i18n/en'
import zh from '../i18n/zh'
import th from '../i18n/th'

const translations = { en, zh, th }

export type Lang = 'en' | 'zh' | 'th'
export interface I18nContextValue {
  t: (key: string, fallback?: string) => string
  lang: Lang
  changeLang: (next?: Lang) => void
  // aliases to ease migration
  locale: Lang
  setLocale: (next: Lang) => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export default function I18nProviderClient({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang
    if (saved && ['en', 'zh', 'th'].includes(saved)) setLang(saved)
  }, [])

  const changeLang = (next?: Lang) => {
    const nextLang = next || (lang === 'en' ? 'zh' : lang === 'zh' ? 'th' : 'en')
    setLang(nextLang)
    localStorage.setItem('lang', nextLang)
  }

  // ✅ t: 支持任意 key 与后备文案
  const t = (key: string, fallback?: string) => (translations[lang] as Record<string, string>)[key] || fallback || key

  const setLocale = (next: Lang) => changeLang(next)

  return (
    <I18nContext.Provider value={{ t, lang, changeLang, locale: lang, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProviderClient')
  return ctx
}
