'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaSearch } from 'react-icons/fa'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState('')

  function handleSearch() {
    if (search.trim() !== '') {
      router.push(`/?search=${encodeURIComponent(search)}`)
    }
  }

  return (
    <header className="w-full h-20 bg-gray-700 shadow-lg shadow-gray-900/50 flex items-center justify-center">
      <section className="px-6 w-full max-w-[1240px] flex items-center justify-between">
        <nav className="flex items-center">
          <Link href="/">
            <h1 className="font-heading text-center text-3xl leading-none font-medium flex flex-row md:text-4xl">
              Taref
              <span className="text-blue-500">inhas</span>
            </h1>
          </Link>

          {session?.user && (
            <Link
              href="/"
              className="font-bold px-5 py-1.5 rounded-xl bg-gray-100 text-gray-900 cursor-pointer mx-5 hover:opacity-80 transition-all duration-300"
            >
              Minhas Tarefas
            </Link>
          )}

          {session?.user && (
            <Link
              href="/archived"
              className="font-bold px-5 py-1.5 rounded-xl bg-gray-100 text-gray-900 cursor-pointer mx-5 hover:opacity-80 transition-all duration-300"
            >
              Tarefas Arquivadas
            </Link>
          )}
        </nav>

        {session?.user && (
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-xl">
            <input
              type="text"
              placeholder="Pesquisar..."
              className="bg-transparent outline-none text-gray-900 placeholder-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <FaSearch
              className="text-gray-700 cursor-pointer hover:text-gray-900"
              onClick={handleSearch}
            />
          </div>
        )}

        {status === 'loading' ? (
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
