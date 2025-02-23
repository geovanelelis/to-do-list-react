'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ChangeEvent, useState } from 'react'

import Head from 'next/head'
import { Textarea } from '../../components/textarea'
import { FaTrashAlt, FaBoxOpen, FaCheck } from 'react-icons/fa'

export default function Dashboard() {
  
  const { data: session, status } = useSession()
  const [input, setInput] = useState('')
  const [endDate, setEndDate] = useState('')
  const [completed, setCompleted] = useState(false)
  const [archived, setArchived] = useState(false)

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (!session) {
    redirect('/')
  }

  return (
    <div className="max-w-[1240px] mx-auto px-5 py-8 md:py-0">
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main>
        <section>
          <div className="font-medium  pb-7 mt-12 flex flex-col items-center justify-center">
            <h1 className="font-heading text-4xl font-bold text-gray-100 mb-6">
              Criar Nova Tarefa
            </h1>

            <form className="w-full flex flex-col gap-4">
              <div>
                <label className="text-gray-100 font-medium">Descrição</label>
                <Textarea
                  placeholder="Digite sua tarefa..."
                  value={input}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setInput(event.target.value)
                  }
                />

                <label htmlFor="end_date" className="text-gray-100 font-medium">
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  id="end_date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-gray-300 outline-none focus:outline-none"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>

              <button
                type="submit"
                className="font-bold px-7 py-2.5 rounded-xl bg-blue-700 text-gray-100 cursor-pointer hover:bg-blue-500 transition-all duration-300"
              >
                Salvar
              </button>
            </form>
          </div>
        </section>

        <section className="mt-8 flex flex-col">
          <h1 className="text-center font-heading text-3xl font-bold text-gray-100 mb-6">
            Minhas tarefas
          </h1>
          <article className="mb-3.5 flex border border-gray-300 rounded-xl p-3.5 flex-col items-start">
            <div className="flex items-center justify-between w-full">
              <p className="whitespace-pre-wrap">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis dolore inventore
                nostrum eaque maiores eum, dolor ullam repellat unde quisquam exercitationem labore
                porro, et eveniet illo veritatis, amet laborum. Facilis..
              </p>
              <button>
                <FaCheck className="size-5 text-gray-100 hover:text-green transition-all duration-300 cursor-pointer mx-2" />
              </button>
              <button>
                <FaBoxOpen className="size-5 text-gray-100 hover:text-yellow transition-all duration-300 cursor-pointer mx-2" />
              </button>
              <button>
                <FaTrashAlt className="size-5 text-gray-100 hover:text-red transition-all duration-300 cursor-pointer mx-2" />
              </button>
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}
