'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBars, FaXmark } from 'react-icons/fa6'
import { BiLogIn, BiLogOut, BiSearch } from 'react-icons/bi'
import NavItem, { NavItemProps } from './navitem'

export function Header() {
  const items: NavItemProps[] = [
    { url: '/', text: 'Inicio' },
    { url: '/savedtasks', text: 'Minhas Tarefas' },
    { url: '/archived', text: 'Tarefas Arquivadas' },
  ]

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)

  const pathname = usePathname()

  const { data: session, status } = useSession()
  const router = useRouter()
  const [search, setSearch] = useState('')

  return (
    <header className="w-full h-20 bg-gray-700 shadow-lg shadow-gray-900/50 flex items-center justify-center">
      <section className="px-6 w-full max-w-[1240px] flex items-center justify-between">
        <nav className="flex justify-between">
          {/*---------------- LOGO DO PROJETO ----------------*/}
          <Link href="/">
            <h1 className="font-heading text-3xl leading-none font-medium flex flex-row md:text-4xl">
              Taref
              <span className="text-blue-500">inhas</span>
            </h1>
          </Link>

          {/*---------------- LISTA DE PÁGINAS ----------------*/}

          {session?.user && (
            <ul
              className={`z-1 xl:flex xl:ml-15 items-center xl:gap-15 max-xl:mt-4 max-xl:shadow-xl max-xl:shadow-gray-900/50 ${
                isMenuOpen
                  ? 'flex items-center flex-col absolute top-15.5 left-0 m-0 w-full bg-gray-700'
                  : 'hidden'
              }`}
            >
              {items.map((item, index) => (
                <NavItem
                  key={index}
                  url={item.url}
                  text={item.text}
                  isActive={pathname === item.url}
                  onClick={() => setIsMenuOpen(false)}
                />
              ))}
            </ul>
          )}
        </nav>

        <div className="flex items-center gap-8 max-md:gap-3">
          {/*---------------- CAMPO DE PESQUISA DE TAREFAS ----------------*/}

          {session?.user && (
            <div className="relative hidden md:flex items-center justify-center gap-3">
              <BiSearch className="absolute left-3 size-5.5 text-gray-200" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  router.push(`/savedtasks?search=${encodeURIComponent(e.target.value)}`)
                }}
                className="border-2 border-gray-300 text-gray-200 rounded-xl py-1.5 pl-10 outline-none"
              />
            </div>
          )}

          {/*---------------- BOTÃO DE LOGIN / LOGOUT ----------------*/}

          {status === 'loading' ? (
            <></>
          ) : session ? (
            <button
              className="flex text-base font-semibold text-gray-100 bg-red-500 items-center gap-1 rounded-xl px-5 py-1.5 
            cursor-pointer hover:bg-red-700 transition-all duration-300 max-md:text-sm max-md:py-1 max-md:px-3
            max-md:rounded-md"
              onClick={() => signOut()}
            >
              Sair
            </button>
          ) : (
            <button
              className="flex text-base font-semibold text-gray-100 bg-green-500 items-center gap-1 rounded-xl px-5 py-1.5 
            cursor-pointer hover:bg-green-700 transition-all duration-300 max-md:text-sm max-md:py-1 max-md:px-3
            max-md:rounded-md"
              onClick={() => signIn('google')}
            >
              Entrar
            </button>
          )}

          {/*---------------- BOTÃO DE MENU PARA DISPOSITÍVOS MENORES ----------------*/}

          {session?.user && (
            <button className="xl:hidden">
              {isMenuOpen ? (
                <FaXmark
                  className="text-gray-200 size-8 block text-5xl cursor-pointer hover:text-gray-100 transition-all duration-300"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              ) : (
                <FaBars
                  className="text-gray-200 size-8 block text-5xl cursor-pointer hover:text-gray-100 transition-all duration-300"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              )}
            </button>
          )}
        </div>
      </section>
    </header>
  )
}
