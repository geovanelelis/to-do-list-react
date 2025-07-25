import { Header } from '@/components/header'
import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Oxanium, Montserrat } from 'next/font/google'
import AuthProvider from '@/components/sessionprovider'
import { ToastContainer } from 'react-toastify'

export const metadata: Metadata = {
  title: 'Tarefinhas',
}

const oxanium = Oxanium({
  weight: ['500', '600'],
  subsets: ['latin'],
  variable: '--font-oxanium',
})

const montserrat = Montserrat({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${oxanium.variable} ${montserrat.variable}`}>
      <body className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
        <AuthProvider>
          <Header />
          <div className="max-md:mt-20">{children}</div>
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  )
}
