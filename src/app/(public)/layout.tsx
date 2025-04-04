import { Header } from '@/components/header'
import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Oxanium, Montserrat } from 'next/font/google'
import AuthProvider from '@/components/sessionprovider'
import { ToastContainer } from 'react-toastify'
import { ParticlesComponent } from '@/components/particles'

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
      {/* <body className="bg-gray-900 text-gray-100 antialiased bg-[url(/background.png)] bg-no-repeat bg-top md:bg-right-top"> */}
      <body className="bg-gray-950">
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
        <ParticlesComponent />
      </body>
    </html>
  )
}
