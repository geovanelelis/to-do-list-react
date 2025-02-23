'use client'

import { useSession } from 'next-auth/react'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

import Head from 'next/head'
import { FaPen, FaTrashAlt } from 'react-icons/fa'

import { db } from '@/services/firebaseConnection'
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore'

interface TaskProps {
  id: string
  user: string
  tarefa: string
  end_date: string
  completed: boolean
  archived: boolean
}

export default function AllTasks() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')?.toLowerCase() || ''

  const [tasks, setTasks] = useState<TaskProps[]>([])

  useEffect(() => {
    if (!session?.user?.email) return

    const tarefasRef = collection(db, 'tarefas')
    const q = query(tarefasRef, where('user', '==', session.user.email))

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

      // Aplica o filtro de busca
      const filteredTasks = lista.filter((task) => task.tarefa.toLowerCase().includes(searchQuery))

      setTasks(filteredTasks)
    })
  }, [session?.user?.email, searchQuery])

  if (status === 'loading') {
    return <p>Carregando...</p>
  }

  if (!session) {
    redirect('/')
  }

  async function handleRemoveTaskBtn(taskId: string) {
    const confirmDelete = window.confirm('Tem certeza que deseja excluir esta tarefa?')

    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'tarefas', taskId))
      } catch (error) {
        console.error('Erro ao excluir tarefa:', error)
      }
    }
  }

  function handleEditTask(taskId: string) {
    router.push(`/create?id=${taskId}`)
  }

  return (
    <div className="max-w-[1240px] mx-auto px-5 py-8 md:py-0">
      <Head>
        <title>Todas as Tarefas</title>
      </Head>

      <main>
        <section className="mt-8 flex flex-col">
          <h1 className="text-center font-heading text-3xl font-bold text-gray-100 mb-6">
            Minhas Tarefas Criadas
          </h1>

          {tasks.length === 0 ? (
            <p className="text-center text-gray-400">Nenhuma tarefa encontrada.</p>
          ) : (
            tasks.map((item) => (
              <article
                key={item.id}
                className="mb-3.5 flex text-gray-900 rounded-xl p-3.5 flex-col items-start bg-gray-100"
              >
                <div className="flex items-center w-full justify-between">
                  <p className="whitespace-pre-wrap text-gray-900">{item.tarefa}</p>

                  <div className="flex items-center gap-4 ml-auto transition-all duration-300 cursor-pointer">
                    <button onClick={() => handleEditTask(item.id)}>
                      <FaPen className="size-5 hover:text-blue-500 transition-all duration-300 cursor-pointer" />
                    </button>
                    <button onClick={() => handleRemoveTaskBtn(item.id)}>
                      <FaTrashAlt className="size-5 hover:text-red transition-all duration-300 cursor-pointer" />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  )
}
