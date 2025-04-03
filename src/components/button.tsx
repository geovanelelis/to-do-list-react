export interface ButtonProps {
  children?: React.ReactNode
  className?: string
  type?: 'button' | 'submit' 
  onClick?: () => void
}

export default function Button(props: ButtonProps) {
  return (
    <button
      type={props.type || 'button'}
      className={
        'font-bold font-sans transition-all duration-300 cursor-pointer text-sm' +
        (props.className ? ` ${props.className}` : '')
      }
      onClick={props.onClick}
    >
      {props.children}
    </button>
  )
}
