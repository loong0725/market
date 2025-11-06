import './globals.css'
import { Inter } from 'next/font/google'
import I18nProviderClient from '../components/I18nProviderClient'
import { AuthProvider } from '../components/AuthProvider'
import Header from '../components/Header'
import Footer from '../components/Footer'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        {/* ✅ Providers 包裹全局 */}
        <I18nProviderClient>
          <AuthProvider>
          <Header />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Footer />
          </AuthProvider>
        </I18nProviderClient>
      </body>
    </html>
  )
}
