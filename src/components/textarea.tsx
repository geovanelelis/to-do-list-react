import { HTMLProps } from 'react'

export function Textarea({ ...rest }: HTMLProps<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full h-25 px-3 py-2 border-2 border-gray-300 rounded-xl text-gray-100 focus:outline-none resize-none max-md:text-sm"
      {...rest}
    ></textarea>
  )
}
