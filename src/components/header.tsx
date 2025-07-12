'use client'

import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBars, FaXmark } from 'react-icons/fa6'
import { BiSearch } from 'react-icons/bi'
import NavItem, { NavItemProps } from './navitem'
import Image from 'next/image'
import Button from './button'
import { FaSignOutAlt } from 'react-icons/fa'
import { showConfirmationAlert } from './alert'

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
    <div className="max-md:fixed top-0 left-0 w-full z-50 bg-gray-950/50 backdrop-blur-md shadow-2xl">
      <header className="w-full h-15 text-gray-100 flex items-center justify-center md:border-b border-white/10">
        <section className="px-6 xl:px-0 w-full max-w-[1240px] flex items-center justify-between max-md:grid max-md:grid-cols-[auto_1fr_auto] max-md:gap-6">
          <nav className="flex items-center gap-8">
            {/* LOGO */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src={'/logotarefinhas.png'}
                alt="Logo do site tarefinhas"
                width={35}
                height={35}
              />
            </Link>

            {/* MENU PRINCIPAL */}
            {session?.user && (
              <ul className="hidden md:flex items-center gap-8">
                {items.map((item, index) => (
                  <NavItem
                    key={index}
                    url={item.url}
                    text={item.text}
                    isActive={pathname === item.url}
                  />
                ))}
              </ul>
            )}
          </nav>

          {/* PESQUISA + BOTÃO SAIR */}
          <div className="flex items-center gap-8 max-md:gap-6 max-md:justify-end">
            {session?.user && (
              <div className="relative flex-1 flex items-center">
                <BiSearch className="z-1 absolute left-3 size-5 text-primary-300" />
                <input
                  type="text"
                  placeholder="Pesquisar.."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    router.push(`/savedtasks?search=${encodeURIComponent(e.target.value)}`)
                  }}
                  className="border border-white/10 placeholder-gray-400 text-sm rounded-xl py-1.5 pl-10 outline-none w-full focus:bg-gray-950/30 transition-all duration-300"
                />
              </div>
            )}

            {status === 'authenticated' && (
              <Button
                onClick={() => {
                  const username = session?.user?.name?.split(' ')[0]
                  showConfirmationAlert({
                    children: <></>,
                    title: `Deseja sair da conta, ${username}?`,
                    content: '',
                    onConfirm: () => {
                      localStorage.removeItem('hasLoggedIn')
                      signOut()
                    },
                  })
                }}
                className="max-md:hidden text-gray-200 border border-white/10 rounded-xl items-center px-5 py-1.5 cursor-pointer hover:bg-red-700 hover:border-red-700"
              >
                Sair
              </Button>
            )}
          </div>

          {/* BOTÃO MENU MOBILE */}
          {session?.user && (
            <Button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? (
                <FaXmark className="text-gray-200 size-7 transition-all duration-300" />
              ) : (
                <FaBars className="text-gray-200 size-7 transition-all duration-300" />
              )}
            </Button>
          )}
        </section>
      </header>

      {/* MENU MOBILE */}
      {session?.user && isMenuOpen && (
        <ul className="md:hidden flex flex-col items-center w-full border-t border-white/10">
          {items.map((item, index) => (
            <NavItem
              key={index}
              url={item.url}
              text={item.text}
              isActive={pathname === item.url}
              onClick={() => setIsMenuOpen(false)}
            />
          ))}
          <NavItem
            text="Sair"
            isButton
            onClick={() =>
              showConfirmationAlert({
                children: <></>,
                title: 'Deseja sair da conta?',
                content: '',
                onConfirm: () => {
                  localStorage.removeItem('hasLoggedIn')
                  signOut()
                },
              })
            }
            children={<FaSignOutAlt className="size-4 text-red-700" />}
          />
        </ul>
      )}
    </div>
  )
}
