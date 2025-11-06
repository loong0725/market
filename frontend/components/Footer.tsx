'use client'

import { useI18n } from './I18nProviderClient'

export default function Footer() {
  const { t } = useI18n()
  return (
    <footer className="mt-16 border-t border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl">
      <div className="container-app py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          © {new Date().getFullYear()} AIT Marketplace. {t('copyright')}
        </div>
      </div>
    </footer>
  )
}

