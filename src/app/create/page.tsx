'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'

import Head from 'next/head'
import { Textarea } from '../../components/textarea'
import { FaTrashAlt, FaBoxOpen, FaCheck, FaPen, FaUndo } from 'react-icons/fa'

import { db } from '@/services/firebaseConnection'
import {
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'

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
  const [tasks, setTasks] = useState<TaskProps[]>([])
  const [editTaskId, setEditTaskId] = useState<string | null>(null)

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

    try {
      if (editTaskId) {
        const taskRef = doc(db, 'tarefas', editTaskId)
        await updateDoc(taskRef, {
          tarefa: input,
          end_date: endDate,
        })
      } else {
        await addDoc(collection(db, 'tarefas'), {
          user: session?.user?.email,
          tarefa: input,
          end_date: endDate,
          completed: false,
          archived: false,
        })
      }

      setInput('')
      setEndDate('')
    } catch (error) {
      console.log(error)
    }
  }

  function handleEditTaskBtn(task: TaskProps) {
    setEditTaskId(task.id)
    setInput(task.tarefa)
    setEndDate(task.end_date)
  }

  function handleCancelEdit() {
    setInput('')
    setEndDate('')
    setEditTaskId(null)
  }

  async function handleCompletedBtn(taskId: string, isCompleted: boolean) {
    console.log(`Clicou na tarefa ${taskId}. Status atual: ${isCompleted}`)

    try {
      await updateDoc(doc(db, 'tarefas', taskId), {
        completed: !isCompleted,
      })
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error)
    }
  }

  async function handleArchivedBtn(taskId: string, isCompleted: boolean) {
    try {
      await updateDoc(doc(db, 'tarefas', taskId), {
        archived: true,
      })
      alert('Tarefa arquivada com sucesso!')
    } catch (error) {
      console.error('Erro ao arquivar tarefa:', error)
    }
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

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="font-bold px-7 py-2.5 rounded-xl bg-blue-700 text-gray-100 cursor-pointer hover:bg-blue-500 transition-all duration-300"
                >
                  Salvar
                </button>

                {editTaskId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="font-bold px-7 py-2.5 rounded-xl bg-gray-300 text-gray-900 cursor-pointer hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                )}
              </div>
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
              className={`mb-3.5 flex text-gray-900 rounded-xl p-3.5 flex-col items-start  ${
                item.completed ? 'bg-gray-100 opacity-75' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-2/3">
                    <p className="text-gray-500 text-xs font-medium">Descrição</p>
                    <p
                      className={`whitespace-pre-wrap ${
                        item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {item.tarefa}
                    </p>
                  </div>

                  <div className="flex flex-col items-end w-1/4">
                    <p className="text-gray-500 text-xs font-medium">Data de Conclusão</p>
                    <p
                      className={`text-gray-900 ${
                        item.completed ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {new Date(item.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-auto transition-all duration-300 cursor-pointer">
                  <button onClick={() => handleEditTaskBtn(item)}>
                    <FaPen className="size-5 hover:text-blue-500 transition-all duration-300 cursor-pointer" />
                  </button>
                  <button onClick={() => handleCompletedBtn(item.id, item.completed)}>
                    <FaCheck className="size-5 hover:text-green transition-all duration-300 cursor-pointer" />
                  </button>

                  {item.completed && (
                    <button onClick={() => handleArchivedBtn(item.id, item.completed)}>
                      <FaBoxOpen className="size-5 hover:text-yellow transition-all duration-300 cursor-pointer" />
                    </button>
                  )}
                  <button onClick={() => handleRemoveTaskBtn(item.id)}>
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
