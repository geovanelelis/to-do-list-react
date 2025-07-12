'use client'

import { useSession } from 'next-auth/react'
import { redirect, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

import Head from 'next/head'
import { FaCheck, FaPlus, FaTasks, FaCalendarAlt, FaArchive } from 'react-icons/fa'
import { MdArchive, MdDashboard } from 'react-icons/md'
import { BsStars } from 'react-icons/bs'

import { db } from '@/services/firebaseConnection'
import { collection, query, where, onSnapshot, orderBy, addDoc } from 'firebase/firestore'

import Loading from '@/components/loading'
import { showAlert } from '@/components/alert'
import Button from '@/components/button'
import TaskModal from '@/components/createtaskmodal'
import ShowTaskModal from '@/components/showtaskmodal'

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

export default function Dashboardd() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tasks, setTasks] = useState<TaskProps[]>([])
  const [isModalOpen, setIsCreatedModalOpen] = useState(false)
  const [isShowTaskModalOpen, setIsShowTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskProps | null>(null)

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

  function openCreateTaskModal() {
    setIsCreatedModalOpen(true)
  }

  function openShowTaskModal(id: string) {
    const task = tasks.find((item) => item.id === id)
    if (task) {
      setSelectedTask(task)
      setIsShowTaskModalOpen(true)
    }
  }

  async function handleSubmitTask(task: TaskProps) {
    try {
      await addDoc(collection(db, 'tarefas'), {
        user: session?.user?.email,
        tarefa: task.tarefa,
        end_date: task.end_date,
        completed: false,
        archived: false,
        created_at: new Date(),
      })
      showAlert('success', 'Tarefa salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      showAlert('error', 'Erro ao salvar tarefa!')
    }
  }

  const username = session?.user?.name.split(' ')[0] || 'Visitante'
  const activeTasks = tasks.filter((item) => !item.archived)
  const completedTasks = tasks.filter((item) => item.completed && !item.archived)
  const archivedTasks = tasks.filter((item) => item.archived)

  return (
    <div className="px-4">
      <Head>
        <title>Dashboard - Minhas Tarefas</title>
      </Head>

      <div className="mt-8 relative max-w-7xl mx-auto text-white">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl md:rounded-2xl">
              <BsStars className="text-xl md:text-2xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-clip-text text-transparent">
              Olá, {username}!
            </h1>
          </div>
          <p className="text-base md:text-xl text-gray-300 font-light">
            Gerencie suas tarefas com estilo e produtividade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total de Tarefas</p>
                <p className="text-3xl font-bold">{activeTasks.length}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FaTasks className="text-2xl text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Concluídas</p>
                <p className="text-3xl font-bold">{completedTasks.length}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FaCheck className="text-2xl text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 backdrop-blur-sm border border-amber-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-300 text-sm font-medium">Arquivadas</p>
                <p className="text-3xl font-bold">{archivedTasks.length}</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <MdArchive className="text-2xl text-amber-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Progresso</p>
                <p className="text-3xl font-bold text-white">
                  {activeTasks.length > 0
                    ? Math.round((completedTasks.length / activeTasks.length) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <MdDashboard className="text-2xl text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <FaCalendarAlt className="text-xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Tarefas Recentes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {activeTasks.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="p-4 bg-gray-500/10 rounded-full w-fit mx-auto mb-4">
                  <FaTasks className="text-4xl text-gray-400" />
                </div>
                <p className="text-gray-400 text-lg">Nenhuma tarefa encontrada</p>
                <p className="text-gray-500 text-sm mt-2">Crie sua primeira tarefa para começar!</p>
              </div>
            ) : (
              activeTasks.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 cursor-pointer hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/50 transition-all duration-300 hover:scale-105"
                  onClick={() => openShowTaskModal(item.id)}
                >
                  <div className="flex items-start justify-between md:mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-base md:text-lg mb-2 group-hover:text-primary-300 transition-colors">
                        {item.tarefa.length > 50 ? item.tarefa.slice(0, 50) + '...' : item.tarefa}
                      </h3>
                      {item.end_date && (
                        <p className="text-sm text-gray-400 flex items-center gap-1">
                          <FaCalendarAlt className="text-xs" />
                          {new Date(item.end_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <div
                      className={`p-2 rounded-lg ml-4 ${
                        item.completed
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {item.completed ? <FaCheck /> : <FaTasks />}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-md transform scale-x-0 group-hover:scale-x-90 transition-transform duration-300"></div>
                </div>
              ))
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className="group flex items-center gap-3 bg-gradient-to-r from-primary-500 to-indigo-500 hover:from-primary-600 hover:to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={openCreateTaskModal}
            >
              <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" />
              Criar Tarefa
            </Button>

            <Button
              className="group flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/savedtasks')}
            >
              <FaCheck className="text-sm group-hover:scale-110 transition-transform duration-300" />
              Ver Salvas
            </Button>

            <Button
              className="group flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/archived')}
            >
              <MdArchive className="text-sm group-hover:scale-110 transition-transform duration-300" />
              Arquivadas
            </Button>
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsCreatedModalOpen(false)}
        onSubmit={handleSubmitTask}
      />
      <ShowTaskModal
        isOpen={isShowTaskModalOpen}
        onClose={() => setIsShowTaskModalOpen(false)}
        item={selectedTask}
      />
    </div>
  )
}
