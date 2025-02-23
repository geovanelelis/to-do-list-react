'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="w-full h-20 bg-gray-700 shadow-lg shadow-gray-900/50 flex items-center justify-center">
      <section className="px-6 w-full max-w-[1240px] flex items-center justify-between">
        <nav className="flex items-center">
          <Link href="/">
            <h1 className="font-heading text-center text-3xl leading-none font-medium flex flex-rol md:text-4xl">
              Taref
              <span className="text-blue-500">inhas</span>
            </h1>
          </Link>

          {session?.user && (
            <Link
              href="/dashboard"
              className="font-bold px-5 py-1.5 rounded-xl bg-gray-100 text-gray-900 cursor-pointer mx-5 hover:opacity-80 transition-all duration-300"
            >
              Minhas Tarefas
            </Link>
          )}
        </nav>

        {status == 'loading' ? (
          <></>
        ) : session ? (
          <button className="button font-bold" onClick={() => signOut()}>
            Olá {session?.user?.name}
          </button>
        ) : (
          <button className="button" onClick={() => signIn('google')}>
            Acessar
          </button>
        )}
      </section>
    </header>
  )
}
