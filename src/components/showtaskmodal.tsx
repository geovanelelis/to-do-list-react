'use client'

import { db } from '@/services/firebaseConnection'
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { FaTimes, FaCalendarAlt, FaCheckCircle, FaFileAlt } from 'react-icons/fa'
import { BsStars } from 'react-icons/bs'
import { MdArchive } from 'react-icons/md'

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

type TaskModalProps = {
  isOpen: boolean
  onClose: () => void
  item?: TaskProps
}

export default function ShowTaskModal({ isOpen, onClose, item }: TaskModalProps) {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TaskProps[]>([])

  useEffect(() => {
    if (!session?.user?.email) return

    const tarefasRef = collection(db, 'tarefas')
    const q = query(tarefasRef)

    return onSnapshot(q, (snapshot) => {
      let tasks = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
        }
      }) as TaskProps[]

      setTasks(tasks)
    })
  }, [session?.user?.email])

  if (!isOpen) return null

  // Fecha o modal ao clicar no backdrop
  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-gray-950/80 backdrop-blur-sm px-4 py-8"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out rounded-4xl md:rounded-3xl">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>

          {/* Conteúdo do Modal */}
          <div className="relative bg-white/5 backdrop-blur-md md:border border-white/10 rounded-4xl md:rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl">
                  <BsStars className="text-xl text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Detalhes da Tarefa
                </h2>
              </div>

              <button
                onClick={onClose}
                className="group p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
              >
                <FaTimes className="text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="space-y-6">
              {/* Descrição */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FaFileAlt className="text-primary-400" />
                  <label className="text-gray-300 font-medium">Descrição</label>
                </div>
                <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <p className="text-white leading-relaxed whitespace-pre-line">
                    {item?.tarefa || 'Nenhuma descrição disponível'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Data de criação */}
                {item?.created_at && (
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarAlt className="text-purple-400" />
                      <span className="text-purple-300 font-medium text-sm">Criada em</span>
                    </div>
                    <p className="text-white font-semibold">
                      {item.created_at &&
                        new Date(
                          typeof item.created_at === 'string'
                            ? item.created_at
                            : item.created_at.toDate()
                        ).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {/* Data limite */}
                {!item?.archived && (
                  <div>
                    {item?.end_date && !isNaN(new Date(item.end_date).getTime()) ? (
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCalendarAlt className="text-blue-400" />
                          <span className="text-blue-300 font-medium text-sm">Data Limite</span>
                        </div>
                        <p className="text-white font-semibold">
                          {new Date(item.end_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCalendarAlt className="text-blue-400" />
                          <span className="text-blue-300 font-medium text-sm">Data Limite</span>
                        </div>
                        <p className="text-white font-semibold">Não informado</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Data arquivada */}
                {item?.archived && (
                  <div className="p-4 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 backdrop-blur-sm border border-amber-500/20 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <MdArchive className="text-amber-400" />
                      <span className="text-amber-300 font-medium text-sm">Arquivada em</span>
                    </div>
                    <p className="text-white font-semibold">
                      {new Date(
                        typeof item.archived_at === 'string'
                          ? item.archived_at
                          : item.archived_at.toDate()
                      ).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                {/* Status */}
                {!item?.archived && (
                  <div>
                    {item?.completed ? (
                      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCheckCircle className="text-emerald-400" />
                          <span className="text-emerald-300 font-medium text-sm">Status</span>
                        </div>
                        <p className="text-white font-semibold">Concluída</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/20 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <FaCheckCircle className="text-amber-400" />
                          <span className="text-amber-300 font-medium text-sm">Status</span>
                        </div>
                        <p className="text-white font-semibold">Pendente</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
