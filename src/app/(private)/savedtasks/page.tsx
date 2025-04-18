'use client'

import { useSession } from 'next-auth/react'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

import Head from 'next/head'
import { FaPen, FaTrashAlt, FaCheck, FaUndo } from 'react-icons/fa'
import { MdArchive, MdUnarchive } from 'react-icons/md'

import { db } from '@/services/firebaseConnection'
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  orderBy,
} from 'firebase/firestore'

import Loading from '@/components/loading'
import { showAlert, showConfirmationAlert } from '@/components/alert'
import Button from '@/components/button'

interface TaskProps {
  id: string
  user: string
  tarefa: string
  end_date: string
  completed: boolean
  archived: boolean
  created_at: string
}

export default function SavedTasks() {
  return (
    <Suspense fallback={<Loading />}>
      <SavedTasksContent />
    </Suspense>
  )
}

function SavedTasksContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')?.toLowerCase() || ''

  const [tasks, setTasks] = useState<TaskProps[]>([])

  useEffect(() => {
    if (!session?.user?.email) return

    const tarefasRef = collection(db, 'tarefas')
    const q = query(
      tarefasRef,
      orderBy('created_at', 'desc'),
      where('user', '==', session.user.email)
    )

    return onSnapshot(q, (snapshot) => {
      let lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskProps[]

      const filteredTasks = lista.filter((task) => task.tarefa.toLowerCase().includes(searchQuery))

      setTasks(filteredTasks)
    })
  }, [session?.user?.email, searchQuery])

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    redirect('/')
  }
  async function handleCompletedBtn(taskId: string, isCompleted: boolean) {
    console.log(`Clicou na tarefa ${taskId}. Status atual: ${isCompleted}`)

    try {
      await updateDoc(doc(db, 'tarefas', taskId), {
        completed: !isCompleted,
        archived: false,
      })
    } catch (error) {
      console.error('Erro ao marcar tarefa como concluída:', error)
    }
  }

  async function handleArchivedBtn(taskId: string) {
    console.log('Tentando buscar a tarefa com ID: ', taskId)
    try {
      const taskRef = doc(db, 'tarefas', taskId)
      const taskSnap = await getDoc(taskRef)

      if (taskSnap.exists()) {
        const currentArchivedState = taskSnap.data().archived
        console.log('Tarefa encontrada. Estado atual de archived:', !currentArchivedState)

        await updateDoc(taskRef, {
          archived: !currentArchivedState,
        })
        currentArchivedState
          ? showAlert('info', 'Tarefa desarquivada!')
          : showAlert('success', 'Tarefa arquivada!')
      } else {
        console.log('Tarefa não encontrada')
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

  function handleEditTask(taskId: string) {
    router.push(`/?id=${taskId}`)
  }

  function handleCreateTask() {
    router.push('/')
  }

  return (
    <div className="max-w-[1240px] mx-auto px-5 py-8 md:py-0">
      <Head>
        <title>Todas as Tarefas</title>
      </Head>

      <main>
        <section className="mt-12 flex flex-col max-md:mt-6">
          <h1 className="text-center font-heading text-4xl font-bold text-gray-100 mb-8">
            Minhas Tarefas
          </h1>

          {tasks.length === 0 ? (
            <p className="text-center text-gray-400 mb-4">Nenhuma tarefa encontrada.</p>
          ) : (
            tasks.map((item) => (
              <article
                key={item.id}
                className={`mb-3.5 flex rounded-xl p-3.5 flex-col items-start transition-all duration-300  ${
                  item.completed
                    ? 'bg-gray-950 text-primary-700 border border-b-5 border-primary-950'
                    : 'bg-primary-950 text-primary-300 hover:scale-101'
                }`}
              >
                <div className="flex items-center w-full justify-between">
                  <div className="flex w-full gap-4">
                    <div className="flex flex-col w-2/3">
                      <p className="text-xs font-medium max-md:text-[10px]">Descrição</p>
                      <p
                        className={`whitespace-pre-wrap max-md:text-sm ${item.completed ? '' : ''}`}
                      >
                        {item.tarefa}
                      </p>
                    </div>

                    {item.end_date && 'Invalid Date' && (
                      <div className="flex flex-col items-end w-1/4 justify-center">
                        {!item.completed && (
                          <p className="text-xs font-medium max-md:text-[10px]">Data-limite</p>
                        )}
                        {item.completed ? (
                          <p className="text-lg max-md:text-base font-bold">concluída</p>
                        ) : (
                          <p className={`max-md:text-xs ${item.completed ? 'line-through' : ''}`}>
                            {new Date(item.end_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-4 ml-auto transition-all duration-300 max-md:gap-2.5 max-md:ml-2.5 ${
                      item.completed ? 'text-gray-400' : 'text-gray-300'
                    }`}
                  >
                    {!item.completed ? (
                      <Button onClick={() => handleEditTask(item.id)}>
                        <FaPen className="size-5 hover:text-primary-300 transition-all duration-300 max-md:size-4" />
                      </Button>
                    ) : (
                      ''
                    )}
                    <Button onClick={() => handleCompletedBtn(item.id, item.completed)}>
                      {item.completed ? (
                        <FaUndo className="size-5 hover:text-primary-300 transition-all duration-300 max-md:size-4" />
                      ) : (
                        <FaCheck className="size-5 hover:text-green-500 transition-all duration-300 max-md:size-4" />
                      )}
                    </Button>
                    {item.completed && (
                      <Button onClick={() => handleArchivedBtn(item.id)}>
                        {item.archived ? (
                          <MdUnarchive className="size-6 hover:text-yellow transition-all duration-300 max-md:size-4" />
                        ) : (
                          <MdArchive className="size-6 hover:text-yellow transition-all duration-300 max-md:size-4" />
                        )}
                      </Button>
                    )}
                    <Button onClick={() => handleRemoveTaskBtn(item.id)}>
                      <FaTrashAlt className="size-5 hover:text-red-500 transition-all duration-300 max-md:size-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))
          )}

          <div className="flex justify-center">
            <Button
              className=" mt-4.5 bg-primary-700 text-gray-50 font-bold px-6 py-3 rounded-xl hover:bg-primary-900 transition-all duration-300"
              onClick={handleCreateTask}
            >
              Criar nova tarefa
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
