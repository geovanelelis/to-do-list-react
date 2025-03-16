'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'

import Head from 'next/head'
import { FaTrashAlt } from 'react-icons/fa'
import { MdArchive, MdUnarchive } from 'react-icons/md'

import { db } from '@/services/firebaseConnection'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  deleteDoc,
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

export default function ArchivedTasks() {
  const { data: session, status } = useSession()

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
      setTasks(lista)
    })
  }, [session?.user?.email])

  if (status === 'loading') {
    return <Loading />
  }

  if (!session) {
    redirect('/')
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

  return (
    <div className="max-w-[1240px] mx-auto px-5 py-8 md:py-0">
      <Head>
        <title>Tarefas Arquivadas</title>
      </Head>

      <main>
        <section className="mt-12 flex flex-col max-md:mt-6">
          <h1 className="text-center font-heading text-4xl font-bold text-gray-200 mb-8">
            Tarefas Arquivadas
          </h1>
          {tasks.filter((item) => item.archived && item.completed).length === 0 ? (
            <p className="text-center text-gray-400">Nenhuma tarefa arquivada.</p>
          ) : (
            tasks.map((item) =>
              item.archived && item.completed ? (
                <article
                  key={item.id}
                  className="mb-3.5 flex rounded-xl p-3.5 flex-col items-start border border-gray-500 outline-none focus:outline-none shadow-2xl shadow-gray-900/50 text-gray-300 hover:scale-101 transition-all duration-300"
                >
                  <div className="flex items-center w-full justify-between">
                    <div className="flex w-full gap-4">
                      <div className="flex flex-col w-2/3">
                        <p className="text-xs font-medium text-gray-300 max-md:text-[10px]">
                          Descrição
                        </p>
                        <p className="whitespace-pre-wrap max-md:text-sm">{item.tarefa}</p>
                      </div>

                      {item.end_date && 'Invalid Date' && (
                        <div className="flex flex-col items-end w-1/4">
                          <p className=" text-xs font-medium text-gray-300 max-md:text-[10px]">
                            Data-limite
                          </p>
                          <p className="max-md:text-xs">
                            {new Date(item.end_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 ml-auto transition-all duration-300 cursor-pointer max-md:ml-2.5">
                      {item.completed && (
                        <Button onClick={() => handleArchivedBtn(item.id)}>
                          {item.archived ? (
                            <MdUnarchive className="size-6 hover:text-yellow transition-all duration-300 cursor-pointer max-md:size-4" />
                          ) : (
                            <MdArchive className="size-6 hover:text-yellow transition-all duration-300 cursor-pointer max-md:size-4" />
                          )}
                        </Button>
                      )}
                      <Button onClick={() => handleRemoveTaskBtn(item.id)}>
                        <FaTrashAlt className="size-5 hover:text-red transition-all duration-300 cursor-pointer max-md:size-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ) : (
                ''
              )
            )
          )}
        </section>
      </main>
    </div>
  )
}
