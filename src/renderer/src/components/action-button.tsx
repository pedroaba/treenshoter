import type { ComponentProps } from 'react'
import { cn } from '../lib/cn'

type ActionButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'primary' | 'danger'
}

export function ActionButton({
  variant = 'default',
  className,
  ...rest
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center gap-2',
        'py-2.5 px-4',
        'border rounded-lg',
        'text-sm font-medium',
        'cursor-pointer',
        'transition-all duration-150 ease-in-out',
        variant === 'default' && [
          'bg-zinc-800/50 border-zinc-700/50 text-white',
          'hover:bg-zinc-700/70 hover:border-zinc-600/70',
        ],
        variant === 'primary' && [
          'bg-blue-500/20 border-blue-500/30 text-blue-500',
          'hover:bg-blue-500/30 hover:border-blue-500/50',
        ],
        variant === 'danger' && [
          'bg-red-500/20 border-red-500/30 text-red-500',
          'hover:bg-red-500/30 hover:border-red-500/50',
        ],
        className,
      )}
      {...rest}
    />
  )
}
