'use client'

import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { showAlert } from './alert'
import { Textarea } from './textarea'
import Button from './button'
import { useSession } from 'next-auth/react'
import { FaTasks, FaCalendarAlt, FaTimes, FaSave } from 'react-icons/fa'
import { BsStars } from 'react-icons/bs'
import { Timestamp } from 'firebase/firestore'

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
  onSubmit: (task: TaskProps) => void
  item?: TaskProps
}

export default function TaskModal({ isOpen, onClose, onSubmit, item }: TaskModalProps) {
  if (!isOpen) return null

  const { data: session } = useSession()
  const [input, setInput] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setInput(item.tarefa)
      setEndDate(item.end_date)
    } else {
      setInput('')
      setEndDate('')
    }
  }, [item])

  async function handleRegisterTask(event: FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    if (input === '') {
      showAlert('error', 'Erro ao salvar a tarefa!')
      setIsLoading(false)
      return
    }

    const taskData: TaskProps = {
      id: item?.id,
      user: session?.user?.email,
      tarefa: input,
      end_date: endDate,
      completed: item?.completed ?? false,
      archived: item?.archived ?? false,
      created_at: item?.created_at || new Date().toISOString(),
      archived_at: item?.archived_at || new Date().toISOString(),
    }

    try {
      await onSubmit(taskData)
      onClose()
    } catch (error) {
      showAlert('error', 'Erro ao salvar a tarefa!')
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="w-full max-w-2xl transform transition-all duration-300 ease-out">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-3xl blur-xl"></div>

          {/* Conteúdo do Modal */}
          <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-xl">
                  <BsStars className="text-xl text-white" />
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  {item ? 'Editar Tarefa' : 'Nova Tarefa'}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="group p-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all duration-300"
              >
                <FaTimes className="text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
              </button>
            </div>

            {/* Formulário */}
            <form className="space-y-6" onSubmit={handleRegisterTask}>
              {/* Descrição */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-gray-300 font-medium">
                  <FaTasks className="text-primary-400" />
                  Descrição da Tarefa
                </label>
                <div className="relative">
                  <Textarea
                    placeholder="Digite uma descrição detalhada para sua tarefa..."
                    value={input}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                      setInput(event.target.value)
                    }
                    className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 min-h-[120px] resize-none"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    {input.length}/500
                  </div>
                </div>
              </div>

              {/* Data de Conclusão */}
              <div className="space-y-2">
                <label
                  htmlFor="end_date"
                  className="flex items-center gap-2 text-gray-300 font-medium"
                >
                  <FaCalendarAlt className="text-primary-400" />
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  id="end_date"
                  className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="group flex-1 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaSave className="text-sm group-hover:scale-110 transition-transform duration-300" />
                      {item ? 'Atualizar' : 'Salvar'}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={onClose}
                  className="group flex-1 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FaTimes className="text-sm group-hover:scale-110 transition-transform duration-300" />
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
