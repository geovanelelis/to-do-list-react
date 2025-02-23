'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'

import Head from 'next/head'
import { Textarea } from '../../components/textarea'
import { FaTrashAlt, FaBoxOpen, FaCheck } from 'react-icons/fa'

import { db } from '@/services/firebaseConnection'
import { addDoc, collection, query, orderBy, where, onSnapshot } from 'firebase/firestore'

interface HomeProps {
  user: {
    email: string
  }
}

interface TaskProps {
  id: string
  user: string
  tarefa: string
  end_date: string
  completed: boolean
  archived: boolean
}

export default function Dashboard({ user }: HomeProps) {
  const { data: session, status } = useSession()

  const [input, setInput] = useState('')
  const [endDate, setEndDate] = useState('')
  const [completed, setCompleted] = useState(false)
  const [archived, setArchived] = useState(false)
  const [tasks, setTasks] = useState<TaskProps[]>([])

  useEffect(() => {
    if (!session?.user?.email) return

    const tarefasRef = collection(db, 'tarefas')
    const q = query(
      tarefasRef,
      orderBy('end_date', 'desc'),
      where('user', '==', session.user.email)
    )

    return onSnapshot(q, (snapshot) => {
      let lista = [] as TaskProps[]

      snapshot.forEach((doc) => {
        lista.push({
          id: doc.id,
          user: doc.data().user,
          tarefa: doc.data().tarefa,
          end_date: doc.data().end_date,
          completed: doc.data().completed,
          archived: doc.data().archived,
        })
      })
      setTasks(lista)
    })
  }, [session?.user?.email])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (!session) {
    redirect('/')
  }
  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault()

    if (input === '') return

    alert('Teste')

    try {
      await addDoc(collection(db, 'tarefas'), {
        user: session?.user?.email,
        tarefa: input,
        end_date: endDate,
        completed: false,
        archived: false,
      })

      setInput('')
      setEndDate('')
    } catch (error) {
      console.log(error)
    }
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

            <form className="w-full flex flex-col gap-4" onSubmit={handleRegisterTask}>
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

          {tasks.map((item) => (
            <article
              key={item.id}
              className="mb-3.5 flex text-gray-900 rounded-xl p-3.5 flex-col items-start bg-gray-100"
            >
              <div className="flex items-center w-full justify-between">
                <p className="whitespace-pre-wrap">{item.tarefa}</p>

                <div className="flex items-center gap-4 ml-auto  transition-all duration-300 cursor-pointer">
                  <button>
                    <FaCheck className="size-5 hover:text-green transition-all duration-300 cursor-pointer" />
                  </button>
                  <button>
                    <FaBoxOpen className="size-5 hover:text-yellow transition-all duration-300 cursor-pointer" />
                  </button>
                  <button>
                    <FaTrashAlt className="size-5 hover:text-red transition-all duration-300 cursor-pointer" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  )
}
