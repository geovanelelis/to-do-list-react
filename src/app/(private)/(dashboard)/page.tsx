'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { ChangeEvent, FormEvent, useState, useEffect } from 'react'

import Head from 'next/head'
import { Textarea } from '@/components/textarea'
import { FaTrashAlt, FaCheck, FaPen, FaUndo } from 'react-icons/fa'
import { MdArchive, MdUnarchive } from 'react-icons/md'

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
  getDoc,
  limit,
} from 'firebase/firestore'

import Loading from '@/components/loading'
import { showAlert, showAlertUser, showConfirmationAlert } from '@/components/alert'

interface TaskProps {
  id: string
  user: string
  tarefa: string
  end_date: string
  completed: boolean
  archived: boolean
  created_at: string
}

export default function Dashboard() {
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
      orderBy('created_at', 'desc'),
      where('user', '==', session.user.email),
      limit(3)
    )

    return onSnapshot(q, (snapshot) => {
      let lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskProps[]
      setTasks(lista)
    })
  }, [session?.user?.email])

  useEffect(() => {
    const username = session?.user?.name?.split(' ')[0]

    if (session?.user) {
      const hasLoggedInBefore = localStorage.getItem('hasLoggedIn')

      if (!hasLoggedInBefore) {
        showAlertUser(`👽 Seja bem-vindo(a) ${username}`)
        localStorage.setItem('hasLoggedIn', 'true')
      }
    }
  }, [status])

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    redirect('/')
  }

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault()

    if (input === '') return showAlert('error', 'Erro ao salvar a tarefa!')

    try {
      if (editTaskId) {
        const taskRef = doc(db, 'tarefas', editTaskId)
        await updateDoc(taskRef, {
          tarefa: input,
          end_date: endDate,
        })
        setEditTaskId(null)
      } else {
        await addDoc(collection(db, 'tarefas'), {
          user: session?.user?.email,
          tarefa: input,
          end_date: endDate,
          completed: false,
          archived: false,
          created_at: new Date(),
        })
      }

      showAlert('success', 'A tarefa foi salva com sucesso!')

      setInput('')
      setEndDate('')
    } catch (error) {
      console.log(error)

      showAlert('error', 'Erro ao salvar a tarefa!')
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

  async function handleArchivedBtn(taskId: string) {
    console.log('Tentando buscar a tarefa com ID:', taskId)
    try {
      const taskRef = doc(db, 'tarefas', taskId)
      const taskSnap = await getDoc(taskRef)

      if (taskSnap.exists()) {
        const currentArchivedState = taskSnap.data().archived
        console.log('Tarefa encontrada. Estado atual de archived:', currentArchivedState)

        await updateDoc(taskRef, {
          archived: !currentArchivedState,
        })
        currentArchivedState
          ? showAlert('info', 'Tarefa desarquivada!')
          : showAlert('success', 'Tarefa arquivada!')
      } else {
        console.error('Tarefa não encontrada!')
      }
    } catch (error) {
      console.error('Erro ao arquivar tarefa:', error)
    }
  }

  async function handleRemoveTaskBtn(taskId: string) {
    showConfirmationAlert({
      children: <FaTrashAlt className="size-5 flex items-center justify-center" />,
      title: 'Excluir Tarefa?',
      content: 'Essa ação não pode ser desfeita.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'tarefas', taskId))
          showAlert('error', 'Tarefa excluída!')
        } catch (error) {
          console.error('Erro ao excluir tarefa:', error)
          showAlert('error', 'Erro ao excluir tarefa!')
        }
      },
    })
  }

  return (
    <div className="max-w-[1240px] mx-auto px-5 py-8 md:py-0">
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main>
        <section>
          <div className="font-medium mt-12 flex flex-col items-center justify-center max-md:mt-6">
            <h1 className="font-heading text-4xl font-bold text-gray-100 mb-6 ">
              Criar Nova Tarefa
            </h1>

            <form className="w-full flex flex-col gap-4" onSubmit={handleRegisterTask}>
              <div>
                <label className="text-gray-100 font-medium max-md:text-sm">Descrição</label>
                <Textarea
                  placeholder="Digite sua tarefa..."
                  value={input}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setInput(event.target.value)
                  }
                />

                <label htmlFor="end_date" className="text-gray-100 font-medium max-md:text-sm">
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  id="end_date"
                  className="w-full px-3 py-2 border border-gray-500 rounded-xl text-gray-300 outline-none focus:outline-none max-md:text-sm"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="font-bold px-7 py-2.5 w-full rounded-xl bg-blue-500 text-gray-100 cursor-pointer hover:bg-blue-700 transition-all duration-300 "
                >
                  Salvar
                </button>

                {editTaskId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="font-bold px-7 py-2.5 w-full rounded-xl bg-gray-300 text-gray-900 cursor-pointer hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="mt-12 flex flex-col">
          <h1 className="text-center font-heading text-3xl font-bold text-gray-100 mb-6">
            Últimas Tarefas Criadas
          </h1>

          {tasks.map((item) => (
            <article
              key={item.id}
              className={`mb-3.5 flex rounded-xl p-3.5 flex-col items-start hover:scale-101 transition-all duration-300  ${
                item.completed
                  ? 'bg-gray-600 text-gray-200 opacity-60'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center w-full justify-between">
                <div className="flex w-full gap-4">
                  <div className="flex flex-col w-2/3">
                    <p className="text-xs font-medium max-md:text-[10px]">Descrição</p>
                    <p
                      className={`whitespace-pre-wrap max-md:text-sm ${
                        item.completed ? 'line-through' : ''
                      }`}
                    >
                      {item.tarefa}
                    </p>
                  </div>

                  {item.end_date && 'Invalid Date' && (
                    <div className="flex flex-col items-end w-1/4">
                      <p className="text-xs font-medium max-md:text-[10px]">Data-limite</p>
                      <p className={`max-md:text-xs ${item.completed ? 'line-through' : ''}`}>
                        {new Date(item.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 ml-auto transition-all duration-300 cursor-pointer max-md:gap-2.5 max-md:ml-2.5">
                  {!item.completed ? (
                    <button onClick={() => handleEditTaskBtn(item)}>
                      <FaPen className="size-5 hover:text-blue-500 transition-all duration-300 cursor-pointer max-md:size-4" />
                    </button>
                  ) : (
                    ''
                  )}
                  <button onClick={() => handleCompletedBtn(item.id, item.completed)}>
                    {item.completed ? (
                      <FaUndo className="size-5 hover:text-blue-500 transition-all duration-300 cursor-pointer max-md:size-4" />
                    ) : (
                      <FaCheck className="size-5 hover:text-green-500 transition-all duration-300 cursor-pointer max-md:size-4" />
                    )}
                  </button>

                  {item.completed && (
                    <button onClick={() => handleArchivedBtn(item.id)}>
                      {item.archived ? (
                        <MdUnarchive className="size-6 hover:text-yellow transition-all duration-300 cursor-pointer max-md:size-4" />
                      ) : (
                        <MdArchive className="size-6 hover:text-yellow transition-all duration-300 cursor-pointer max-md:size-4" />
                      )}
                    </button>
                  )}
                  <button onClick={() => handleRemoveTaskBtn(item.id)}>
                    <FaTrashAlt className="size-5 hover:text-red-300 transition-all duration-300 cursor-pointer max-md:size-4" />
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
