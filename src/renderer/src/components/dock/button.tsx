import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type DockButtonProps = ComponentProps<'button'>

export function DockButton({ className, title, ...rest }: DockButtonProps) {
  return (
    <button
      title={title}
      className={cn(
        'size-9 rounded-full text-zinc-300',
        'flex items-center justify-center cursor-pointer',
        'transition-all duration-150 ease-out',
        'hover:bg-zinc-800/60 hover:text-white',
        'data-[state=selected]:bg-zinc-800/60 data-[state=selected]:text-white',
        'active:scale-90 active:bg-zinc-700/80',
        'focus:outline-none',
        className,
      )}
      {...rest}
    />
  )
}
