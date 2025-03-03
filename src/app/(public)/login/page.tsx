'use client'

import Loading from '@/components/loading'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <Loading />
  }
  return (
    <div>
      <Head>
        <title>To Do List</title>
      </Head>

      <main className="max-w-[1240px] mx-auto px-5 py-8 md:py-0">
        <div className="height-home flex items-center justify-center gap-16 flex-col">
          <div className="flex flex-col gap-8 items-center">
            <Image
              src="/todolist.png"
              alt="Imagem de uma pessoa escrevendo uma lista de tarefas"
              width={'480'}
              height={'480'}
              priority
            />

            <h1 className="font-heading text-center text-3xl leading-10 font-medium max-w-2xl flex flex-col md:text-4xl">
              SISTEMA FEITO PARA VOCÊ ORGANIZAR SEUS ESTUDOS E TAREFAS
            </h1>

            <div>
              <section className="flex flex-row">
                {session?.user && (
                  <Link href="/create" className="button">
                    Criar Nova Tarefa
                  </Link>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
