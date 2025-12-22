import { cn } from '../lib/cn'
import type { ComponentProps } from 'react'

type ButtonProps = ComponentProps<'button'>

export function Button({ className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'w-full px-6 py-2 rounded-lg text-white font-semibold bg-blue-500',
        'hover:bg-blue-600 active:scale-95 transition-all duration-150 ease-in-out',
        'focus:outline-none shadow border border-blue-700 select-none',
        className,
      )}
      {...rest}
    />
  )
}
