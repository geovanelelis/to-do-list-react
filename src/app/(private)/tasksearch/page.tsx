'use client'

import { useSession } from 'next-auth/react'
import { redirect, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'

import Head from 'next/head'
import {
  FaTrashAlt,
  FaCheck,
  FaPen,
  FaUndo,
  FaTasks,
  FaCalendarAlt,
  FaAngleDown,
  FaSearch,
} from 'react-icons/fa'
import { MdArchive } from 'react-icons/md'

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
  Timestamp,
} from 'firebase/firestore'

import Loading from '@/components/loading'
import { showAlert, showConfirmationAlert } from '@/components/alert'
import Button from '@/components/button'
import TaskModal from '@/components/createtaskmodal'
import { FaAngleUp } from 'react-icons/fa6'
import ShowTaskModal from '@/components/showtaskmodal'
import { Tooltip } from 'react-tooltip'

interface TaskProps {
  id: string
  user: string
  tarefa: string
  end_date: string
  completed: boolean
  archived: boolean
  created_at: string | Timestamp
  archived_at: string | Timestamp
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShowTaskModalOpen, setIsShowTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskProps | null>(null)
  const [taskToEdit, setTaskToEdit] = useState<TaskProps | null>(null)
  const [tasks, setTasks] = useState<TaskProps[]>([])
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')?.toLowerCase() || ''
  const [showActionsMobile, setShowActionsMobile] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user?.email) return

    const tarefasRef = collection(db, 'tarefas')
    const q = query(
      tarefasRef,
      orderBy('created_at', 'desc'),
      where('user', '==', session.user.email || '')
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

  function openShowTaskModal(id: string) {
    const task = tasks.find((item) => item.id === id)
    if (task) {
      setSelectedTask(task)
      setIsShowTaskModalOpen(true)
    }
  }

  function handleEditTaskBtn(task: TaskProps) {
    setTaskToEdit(task)
    setIsModalOpen(true)
  }

  async function handleSubmitTask(task: TaskProps) {
    try {
      if (taskToEdit) {
        const taskRef = doc(db, 'tarefas', task.id)
        await updateDoc(taskRef, {
          tarefa: task.tarefa,
          end_date: task.end_date,
        })
      } else {
        await addDoc(collection(db, 'tarefas'), {
          user: session?.user?.email,
          tarefa: task.tarefa,
          end_date: task.end_date,
          completed: false,
          archived: false,
          created_at: new Date(),
          archived_at: null,
        })
      }
      showAlert('success', 'Tarefa salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      showAlert('error', 'Erro ao salvar tarefa!')
    }
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
          archived_at: new Date().toISOString(),
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

  const activeTasks = tasks.filter((item) => !item.archived)

  return (
    <div className="px-4">
      <Head>
        <title>Minhas Tarefas - Painel de Controle</title>
      </Head>

      <div className="mt-8 relative max-w-7xl mx-auto text-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl md:rounded-2xl">
              <FaSearch className="text-lg md:text-xl" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              Resultado da Pesquisa
            </h1>
          </div>
        </div>

        {/* Container principal das tarefas */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl px-6 py-8 md:px-8 mb-8 shadow-2xl transition-all duration-300">
          {/* Lista de Tarefas */}
          <div className="space-y-4">
            {searchQuery === '' ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-500/10 rounded-full w-fit mx-auto mb-4">
                  <FaTasks className="text-4xl text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">Nenhuma tarefa encontrada</p>
                <p className="text-gray-500 text-sm mt-2">
                  Pesquise uma tarefa para que ela apareça aqui!
                </p>
              </div>
            ) : activeTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="p-4 bg-gray-500/10 rounded-full w-fit mx-auto mb-4">
                  <FaTasks className="text-4xl text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">Nenhuma tarefa corresponde à sua pesquisa</p>
                <p className="text-gray-500 text-sm mt-2">Tente pesquisar por outro termo!</p>
              </div>
            ) : (
              activeTasks.map((item) => (
                <div
                  key={item.id}
                  className={`group relative bg-gradient-to-r backdrop-blur-sm border rounded-2xl p-4 md:p-6 transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                    item.completed
                      ? 'from-green-500/10 to-green-600/10 border-green-500/30 hover:from-green-500/20 hover:to-green-600/20'
                      : 'from-slate-800/50 to-slate-700/50 border-slate-600/50 hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/50'
                  }`}
                  onClick={() => openShowTaskModal(item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                              Descrição
                            </span>
                            {item.completed && (
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                                Concluída
                              </span>
                            )}
                          </div>
                          <h3
                            className={`text-sm md:text-lg font-semibold mb-2 ${
                              item.completed ? 'text-green-300 line-through' : 'text-white'
                            }`}
                          >
                            {item.tarefa.length > 50
                              ? item.tarefa.slice(0, 50) + '...'
                              : item.tarefa}
                          </h3>

                          {item.end_date && !isNaN(new Date(item.end_date).getTime()) && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                              <FaCalendarAlt className="text-xs" />
                              <span className="font-medium">Data limite:</span>
                              <span>{new Date(item.end_date).toLocaleDateString('pt-BR')}</span>
                            </div>
                          )}
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
                        {!item.completed && (
                          <div className="tooltipstyle">
                            <Button
                              onClick={(event) => {
                                event.stopPropagation()
                                handleEditTaskBtn(item)
                              }}
                              data-tooltip-id="editBtn"
                              data-tooltip-content="Editar Tarefa"
                              className="group/btn md:md:p-3 md:bg-blue-500/20 md:hover:bg-blue-500/30 md:border md:border-blue-500/30 md:hover:border-blue-500/50 rounded-xl transition-all duration-300 hover:scale-110"
                            >
                              <FaPen className="size-4 text-blue-400 md:text-blue-400 group-hover/btn:text-blue-400 md:group-hover/btn:text-blue-300 transition-colors duration-300" />
                            </Button>
                            <Tooltip id="editBtn" className="tooltip" classNameArrow="arrowBlue" />
                          </div>
                        )}

                        <div className="tooltipstyle">
                          <Button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleCompletedBtn(item.id, item.completed)
                            }}
                            className={`group/btn md:p-3 md:border rounded-xl transition-all duration-300 hover:scale-110 ${
                              item.completed
                                ? 'md:bg-blue-500/20 md:hover:bg-blue-500/30 md:border-blue-500/30 md:hover:border-blue-500/50'
                                : 'md:bg-green-500/20 md:hover:bg-green-500/30 md:border-green-500/30 md:hover:border-green-500/50'
                            }`}
                            data-tooltip-id={`${item.completed ? 'undoBtn' : 'checkBtn'}`}
                            data-tooltip-content={`${
                              item.completed ? 'Desmarcar concluída' : 'Concluir tarefa'
                            }`}
                          >
                            {item.completed ? (
                              <FaUndo className="size-4 text-blue-400 md:text-blue-400 group-hover/btn:text-blue-400 md:group-hover/btn:text-blue-3000 transition-colors duration-300" />
                            ) : (
                              <FaCheck className="size-4 text-green-300 md:text-green-400 group-hover/btn:text-green-300 transition-colors duration-300" />
                            )}
                          </Button>
                          <Tooltip
                            id={`${item.completed ? 'undoBtn' : 'checkBtn'}`}
                            className="tooltip"
                            classNameArrow={`${item.completed ? 'arrowBlue' : 'arrowEmerald'}`}
                          />
                        </div>

                        {item.completed && (
                          <div className="tooltipstyle">
                            <Button
                              onClick={(event) => {
                                event.stopPropagation()
                                handleArchivedBtn(item.id)
                              }}
                              className="group/btn md:p-3 md:bg-amber-500/20 md:hover:bg-amber-500/30 md:border md:border-amber-500/30 md:hover:border-amber-500/50 rounded-xl transition-all duration-300 hover:scale-110"
                              data-tooltip-id="archiveBtn"
                              data-tooltip-content="Arquivar tarefa"
                            >
                              <MdArchive className="size-4 text-amber-300 md:text-amber-400 group-hover/btn:text-amber-300 transition-colors duration-300" />
                            </Button>
                            <Tooltip
                              id="archiveBtn"
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

                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-indigo-500 rounded-t-md transform scale-x-0 group-hover:scale-x-90 transition-transform duration-300"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTask}
        item={taskToEdit}
      />

      <ShowTaskModal
        isOpen={isShowTaskModalOpen}
        onClose={() => setIsShowTaskModalOpen(false)}
        item={selectedTask}
      />
    </div>
  )
}
