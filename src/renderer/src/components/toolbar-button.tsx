import type { ComponentProps } from 'react'
import { cn } from '../lib/cn'

type ToolbarButtonProps = ComponentProps<'button'>

export function ToolbarButton({ className, ...rest }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center',
        'w-9 h-9',
        'p-0',
        'border-0',
        'bg-transparent',
        'text-zinc-400',
        'rounded-md',
        'cursor-pointer',
        'transition-all duration-150 ease-in-out',
        'hover:bg-zinc-800/60 hover:text-white',
        'data-[active=true]:bg-zinc-800/60 data-[active=true]:text-blue-500',
        'active:scale-90 active:bg-zinc-700/80',
        'focus:outline-none',
        className,
      )}
      {...rest}
    />
  )
}
