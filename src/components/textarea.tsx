import { HTMLProps } from 'react'

export function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
  return (
    <textarea
      className="backdrop-blur-xs h-24 bg-gray-950/0 w-full rounded-xl text-gray-100
      border border-gray-700/70 p-3 resize-none max-md:text-sm focus:outline-none focus:ring focus:ring-primary-700/50"
      {...rest}
    ></textarea>
  )
}
