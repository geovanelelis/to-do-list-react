import Link from 'next/link'
import Button from './button'

export interface NavItemProps {
  url?: string
  text?: string
  isActive?: boolean
  onClick?: () => void
  children?: React.ReactNode
  isButton?: boolean
}

export default function NavItem(props: NavItemProps) {
  return (
    <li className="w-full md:w-auto">
      {props.isButton ? (
        <Button
          onClick={props.onClick!}
          className="md:hidden max-md:flex max-md:justify-center gap-2
        max-md:items-center pb-1 max-md:pt-5 max-md:pb-5 text-red-500
         max-md:hover:bg-gray-900 transition-colors duration-300 w-full cursor-pointer"
        >
          {props.text}
          {props.children}
        </Button>
      ) : (
        <Link
          href={props.url!}
          onClick={props.onClick}
          className={`max-md:flex max-md:justify-center max-md:items-center pb-1 max-md:pt-5 max-md:pb-5 text-gray-200 text-sm md:hover:border-b-2 max-md:hover:bg-gray-900
         md:border-primary-500 transition-colors duration-300 ${
           props.isActive ? 'max-md:bg-gray-900/0 md:border-b-2 md:border-primary-500' : ''
         }`}
        >
          {props.text}
        </Link>
      )}
    </li>
  )
}
