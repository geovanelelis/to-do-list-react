import { HTMLProps } from 'react'

export function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full h-20 px-3 py-2 border border-gray-300 rounded-xl text-gray-100 focus:outline-none resize-none"
      {...rest}
    ></textarea>
  )
}
