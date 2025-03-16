'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaBars, FaXmark } from 'react-icons/fa6'
import { BiSearch } from 'react-icons/bi'
import NavItem, { NavItemProps } from './navitem'
import Image from 'next/image'
import Button from './button'
import { FaSignOutAlt } from 'react-icons/fa'
import { showAlert, showConfirmationAlert } from './alert'

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
    <header className="w-full h-15 bg-gray-900 shadow-lg border-b border-gray-600 shadow-gray-900/50 flex items-center justify-center">
      <section className="px-6 w-full max-w-[1240px] flex items-center justify-between max-md:grid max-md:grid-cols-[auto_1fr_auto] max-md:gap-6">
        <nav className="flex items-center gap-8">
          {/*---------------- LOGO DO PROJETO ----------------*/}
          <Link href="/">
            <Image
              src={'/logotarefinhas.png'}
              alt="Logo do site tarefinhas"
              width={35}
              height={35}
            ></Image>
          </Link>

          {/*---------------- LISTA DE PÁGINAS ----------------*/}

          {session?.user && (
            <ul
              className={`z-1 md:flex items-center md:gap-8 max-md:mt-4 max-md:shadow-md max-md:shadow-gray-900/25 ${
                isMenuOpen
                  ? 'flex items-center flex-col absolute top-11 left-0 m-0 w-full bg-gray-900'
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
                      showAlert('info', 'Você saiu da conta.')
                    },
                  })
                }
                children={<FaSignOutAlt className="size-4" />}
              />
            </ul>
          )}
        </nav>

        <div className="flw-1 flex items-center gap-8 max-md:gap-6 max-md:justify-end">
          {/*---------------- CAMPO DE PESQUISA ----------------*/}

          {session?.user && (
            <div className="relative flex-1 flex items-center">
              <BiSearch className="absolute left-3 size-5 text-blue-300" />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  router.push(`/savedtasks?search=${encodeURIComponent(e.target.value)}`)
                }}
                className="bg-gray-800 border border-gray-600 text-gray-200 text-sm rounded-xl py-1 pl-10 outline-none max-xl:w-44 max-md:w-full"
              />
            </div>
          )}

          {/*---------------- BOTÃO DE LOGIN / LOGOUT ----------------*/}

          {status === 'loading' ? (
            <></>
          ) : (
            session && (
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
                className="max-md:hidden bg-gray-800 border border-gray-600 items-center px-5 py-1 cursor-pointer hover:text-red-300 hover:bg-gray-600"
              >
                Sair
              </Button>
            )
          )}
        </div>

        {status === 'loading' ? (
          <></>
        ) : (
          !session && (
            <Button
              className="bg-green-500 border-0 items-center px-5 py-1.5 cursor-pointer hover:bg-green-700"
              onClick={() => signIn('google')}
            >
              Entrar
            </Button>
          )
        )}

        {/*---------------- BOTÃO DE MENU PARA DISPOSITÍVOS MENORES ----------------*/}

        {session?.user && (
          <Button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? (
              <FaXmark className="text-gray-200 size-7 block text-5xl cursor-pointer hover:text-gray-300 transition-all duration-300" />
            ) : (
              <FaBars className="text-gray-200 size-7 block text-5xl cursor-pointer hover:text-gray-300 transition-all duration-300" />
            )}
          </Button>
        )}
      </section>
    </header>
  )
}
