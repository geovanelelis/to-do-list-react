import Link from 'next/link'

export interface NavItemProps {
  url: string
  text: string
  isActive?: boolean
  onClick?: () => void
}

export default function NavItem(props: NavItemProps) {
  return (
    <li className="w-full xl:w-auto">
      <Link
        href={props.url}
        onClick={props.onClick}
        className={`max-xl:flex max-xl:justify-center max-xl:items-center pb-1 max-xl:pt-5 max-xl:pb-5 text-gray-200 text-lg xl:hover:border-b-2 max-xl:hover:bg-gray-800
         xl:border-blue-500 transition-colors duration-300 ${
           props.isActive ? 'max-xl:bg-gray-600 xl:border-b-2 xl:border-blue-500' : ''
         }`}
      >
        {props.text}
      </Link>
    </li>
  )
}
