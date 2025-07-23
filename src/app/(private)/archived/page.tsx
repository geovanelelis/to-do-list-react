'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useState, useEffect } from 'react'

import Head from 'next/head'
import { FaAngleDown, FaAngleUp, FaTasks, FaTrashAlt } from 'react-icons/fa'
import { MdUnarchive } from 'react-icons/md'
import { BsArchive } from 'react-icons/bs'

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
import ShowTaskModal from '@/components/showtaskmodal'
import { Tooltip } from 'react-tooltip'

interface TaskProps {
  id: string
  user: string
  tarefa: string
  end_date: string
  completed: boolean
  archived: boolean
  created_at: string
  archived_at: string
}

export default function ArchivedTasks() {
  const { data: session, status } = useSession()

  const [tasks, setTasks] = useState<TaskProps[]>([])
  const [isShowTaskModalOpen, setIsShowTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskProps | null>(null)
  const [showActionsMobile, setShowActionsMobile] = useState<string | null>(null)

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

  function handleOpenTaskModal(item: string) {
    const task = tasks.find((task) => task.id === item)
    if (task) {
      setSelectedTask(task)
      setIsShowTaskModalOpen(true)
    }
  }

  async function handleUnarchivedBtn(taskId: string) {
    console.log('Tentando buscar a tarefa com ID: ', taskId)
    try {
      const taskRef = doc(db, 'tarefas', taskId)
      const taskSnap = await getDoc(taskRef)

      if (taskSnap.exists()) {
        const currentArchivedState = taskSnap.data().archived
        const currentCompletedState = taskSnap.data().completed
        console.log('Tarefa encontrada. Estado atual de archived:', !currentArchivedState)

        await updateDoc(taskRef, {
          archived: !currentArchivedState,
          completed: !currentCompletedState,
          archived_at: !currentArchivedState ? new Date().toISOString() : null,
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

  const archivedTasks = tasks.filter((item) => item.archived && item.completed)

  return (
    <div className="px-4">
      <Head>
        <title>Tarefas Arquivadas - Painel de Controle</title>
      </Head>
      <div className="mt-8 relative max-w-7xl mx-auto text-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl md:rounded-2xl">
              <BsArchive className="text-xl md:text-2xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Tarefas Arquivadas
            </h1>
          </div>
          <p className="text-base md:text-xl text-gray-300 font-light">
            Suas tarefas concluídas e arquivadas para consulta
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl px-6 py-8 md:px-8 mb-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <FaTasks className="text-xl text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Histórico de Tarefas</h2>
          </div>

          <div className="space-y-4">
            {archivedTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-amber-500/10 rounded-full w-fit mx-auto mb-4">
                  <BsArchive className="text-4xl text-amber-400" />
                </div>
                <p className="text-gray-400 text-lg">Nenhuma tarefa arquivada</p>
                <p className="text-gray-500 text-sm mt-2">
                  Complete algumas tarefas para vê-las aqui!
                </p>
              </div>
            ) : (
              archivedTasks.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/30 hover:border-amber-500/50 rounded-2xl p-4 md:p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:from-amber-500/20 hover:to-orange-500/20"
                  onClick={() => handleOpenTaskModal(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-amber-300 font-medium uppercase tracking-wide">
                              Tarefa Arquivada
                            </span>
                          </div>
                          <h3 className="text-sm md:text-lg font-semibold text-amber-200 mb-2">
                            {item.tarefa.length > 50
                              ? item.tarefa.slice(0, 50) + '...'
                              : item.tarefa}
                          </h3>

                          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mt-2">
                            <span className="font-medium">Arquivada em:</span>
                            <span>{new Date(item.archived_at).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex max-md:flex-col items-center md:gap-2 ml-4 max-md:bg-gray-900/30 p-2.5 rounded-xl transition-all duration-400">
                      {showActionsMobile === item.id ? (
                        <FaAngleUp
                          className="size-5 text-gray-400 flex md:hidden cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation()
                            setShowActionsMobile(showActionsMobile === item.id ? null : item.id)
                          }}
                        />
                      ) : (
                        <FaAngleDown
                          className="size-5 text-gray-400 flex md:hidden cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation()
                            setShowActionsMobile(showActionsMobile === item.id ? null : item.id)
                          }}
                        />
                      )}

                      <div
                        className={`flex max-md:flex-col items-center gap-3 transition-all duration-400 ${
                          showActionsMobile === item.id ? 'max-h-40 block mt-3' : 'max-h-0 hidden'
                        } md:flex md:flex-row md:opacity-100`}
                      >
                        {item.completed && (
                          <div className="tooltipstyle">
                            <Button
                              onClick={(event) => {
                                event.stopPropagation()
                                handleUnarchivedBtn(item.id)
                              }}
                              className="group/btn md:p-3 md:bg-amber-500/20 md:hover:bg-amber-500/30 md:border md:border-amber-500/30 md:hover:border-amber-500/50 rounded-xl transition-all duration-300 hover:scale-110"
                              data-tooltip-id="unarchiveBtn"
                              data-tooltip-content="Desarquivar tarefa"
                            >
                              <MdUnarchive className="size-4 text-amber-300 md:text-amber-400 group-hover/btn:text-amber-300 transition-colors duration-300" />
                            </Button>
                            <Tooltip
                              id="unarchiveBtn"
                              className="tooltip"
                              classNameArrow="arrowAmber"
                            />
                          </div>
                        )}

                        <div className="tooltipstyle">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleRemoveTaskBtn(item.id)
                            }}
                            className="group/btn md:p-3 md:bg-red-400/20 md:hover:bg-red-400/30 md:border md:border-red-400/30 md:hover:border-red-400/50 rounded-xl transition-all duration-300 hover:scale-110"
                            data-tooltip-id="removeBtn"
                            data-tooltip-content="Excluir tarefa"
                          >
                            <FaTrashAlt className="size-4 text-red-400 md:text-red-400 group-hover/btn:text-red-400 md:group-hover/btn:text-red-300 transition-colors duration-300" />
                          </Button>
                          <Tooltip id="removeBtn" className="tooltip" classNameArrow="arrowRed" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-md transform scale-x-0 group-hover:scale-x-90 transition-transform duration-300"></div>
                </div>
              ))
            )}
          </div>

          {archivedTasks.length > 0 && (
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2 text-amber-300">
                <MdUnarchive className="size-5 w-10 sm:w-fit" />
                <p className="text-sm">
                  <span className="font-medium">Dica:</span> Use o botão de desarquivar para
                  restaurar tarefas ao painel principal.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <ShowTaskModal
        isOpen={isShowTaskModalOpen}
        onClose={() => setIsShowTaskModalOpen(false)}
        item={selectedTask}
      />
    </div>
  )
}
