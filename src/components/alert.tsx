'use client'

import { Flip, Slide, ToastContainer, Zoom, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Button from './button'
import React from 'react'

export interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning'
}

export const showAlert = (type: AlertProps['type'], description: string) => {
  toast[type](description, {
    position: 'top-center',
    autoClose: 1500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Flip,
  })
}

export const showAlertUser = (description: string) => {
  toast(description, {
    position: 'top-center',
    autoClose: 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: 'light',
    transition: Zoom,
  })
}

export const showConfirmationAlert = ({
  title,
  content,
  children,
  onConfirm,
}: {
  title: string
  content: string
  children: React.ReactNode
  onConfirm: () => void
}) => {
  toast(
    ({ closeToast }) => (
      <WithActions
        title={title}
        content={content}
        children={children}
        closeToast={closeToast}
        onConfirm={onConfirm}
      />
    ),
    {
      position: 'top-center',
      autoClose: false,
      closeButton: false,
      transition: Slide,
    }
  )
}

type ConfirmationAlertProps = {
  title: string
  content: string
  children?: React.ReactNode
  closeToast: () => void
  onConfirm: () => void
}

function WithActions({ title, content, children, closeToast, onConfirm }: ConfirmationAlertProps) {
  return (
    <div className="flex flex-col w-full gap-2 p-1">
      <h3 className="text-base font-semibold flex items-center gap-2 text-primary-950">
        {children}
        {title}
      </h3>

      <p className="text-md text-primary-900">{content}</p>

      <div className="flex items-end justify-end gap-2">
        <Button
          onClick={() => {
            onConfirm()
            closeToast()
          }}
          className="transition-all duration-300 text-sm font-semibold bg-primary-900 border-none rounded-md py-1.5 px-5 text-gray-50 hover:bg-primary-950"
        >
          Sim
        </Button>
        <Button
          onClick={closeToast}
          className="transition-all duration-300 text-sm font-semibold bg-primary-900 border-none rounded-md py-1.5 px-5 text-gray-50 hover:bg-primary-950"
        >
          Não
        </Button>
      </div>
    </div>
  )
}

export function Alert() {
  return <ToastContainer />
}
