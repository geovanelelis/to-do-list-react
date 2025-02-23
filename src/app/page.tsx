'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaSearch, FaBars } from 'react-icons/fa'

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (search.trim() !== '') {
      router.push(`/dashboard?search=${search}`)
    }
  }

  return (
    <header className="w-full h-20 bg-gray-700 shadow-lg shadow-gray-900/50 flex items-center justify-center">
      <section className="px-6 w-full max-w-[1240px] flex items-center justify-between">
        <nav className="flex items-center w-full md:w-auto">
          <Link href="/">
            <h1 className="font-heading text-center text-3xl leading-none font-medium flex flex-row md:text-4xl">
              Taref<span className="text-blue-500">inhas</span>
            </h1>
          </Link>
          <button
            className="ml-auto md:hidden text-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <FaBars className="size-6" />
          </button>
        </nav>

        <div className={`flex-col md:flex md:flex-row md:items-center ${menuOpen ? 'flex' : 'hidden'} absolute md:relative top-20 left-0 w-full md:w-auto bg-gray-700 md:bg-transparent p-4 md:p-0 shadow-md md:shadow-none z-50`}>  
          {session?.user && (
            <>
              <Link
                href="/dashboard"
                className="font-bold px-5 py-1.5 rounded-xl bg-gray-100 text-gray-900 cursor-pointer mx-5 hover:opacity-80 transition-all duration-300"
              >
                Minhas Tarefas
              </Link>
              <Link
                href="/archived"
                className="font-bold px-5 py-1.5 rounded-xl bg-gray-100 text-gray-900 cursor-pointer mx-5 hover:opacity-80 transition-all duration-300"
              >
                Tarefas Arquivadas
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="relative">
              <button onClick={() => setShowSearch(!showSearch)}>
                <FaSearch className="size-5 text-gray-100 hover:text-gray-300 transition-all duration-300 cursor-pointer" />
              </button>

              {showSearch && (
                <form
                  onSubmit={handleSearch}
                  className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 p-3 rounded-lg shadow-md flex items-center"
                >
                  <input
                    type="text"
                    className="border px-2 py-1 rounded-l-md outline-none text-gray-900"
                    placeholder="Buscar tarefa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition"
                  >
                    Buscar
                  </button>
                </form>
              )}
            </div>
          )}

          {status === 'loading' ? null : session ? (
            <button className="button font-bold" onClick={() => signOut()}>
              Olá {session?.user?.name}
            </button>
          ) : (
            <button className="button" onClick={() => signIn('google')}>
              Acessar
            </button>
          )}
        </div>
      </section>
    </header>
  )
}