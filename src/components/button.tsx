'use client'

import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({ className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={`font-sans transition-all duration-300 cursor-pointer text-sm${
        className ? ` ${className}` : ''
      }`}
      {...rest}
    >
      {children}
    </button>
  )
}
