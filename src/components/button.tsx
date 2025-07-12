'use client'

import React from 'react'

export interface ButtonProps {
  children?: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
}

export default function Button(props: ButtonProps) {
  return (
    <button
      type={props.type || 'button'}
      className={
        'font-sans transition-all duration-300 cursor-pointer text-sm' +
        (props.className ? ` ${props.className}` : '')
      }
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  )
}
