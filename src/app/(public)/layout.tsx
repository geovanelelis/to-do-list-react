import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Oxanium, Montserrat } from 'next/font/google'
import AuthProvider from '@/components/sessionprovider'
import { ToastContainer } from 'react-toastify'

export const metadata: Metadata = {
  title: 'To Do List',
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
    <html lang="pt-BR" className={`${oxanium.variable} ${montserrat.variable}`}>
      <body className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen overflow-hidden">
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  )
}
