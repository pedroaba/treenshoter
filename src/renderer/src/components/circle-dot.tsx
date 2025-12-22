import { cn } from '../lib/cn'
import type { ComponentProps } from 'react'

type CircleDotProps = Omit<ComponentProps<'div'>, 'children'> & {
  variant?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function CircleDot({
  className,
  variant = 'bottom-right',
  ...props
}: CircleDotProps) {
  return (
    <div
      className={cn(
        'absolute',
        variant === 'top-left' && '-top-2 -left-2',
        variant === 'top-right' && '-top-2 -right-2',
        variant === 'bottom-left' && '-bottom-2 -left-2',
        variant === 'bottom-right' && '-bottom-2 -right-2',
        className,
      )}
      {...props}
    >
      <div className="flex justify-center items-center rounded-full border-2 border-zinc-50 size-4">
        <span className="size-2 rounded-full bg-blue-500" />
      </div>
    </div>
  )
}
