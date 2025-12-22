import { cn } from '../../lib/cn'
import type { ComponentProps } from 'react'

type SeparatorProps = ComponentProps<'div'>

export function Separator({ className, ...props }: SeparatorProps) {
  return <div className={cn('w-px h-4 bg-zinc-800/60', className)} {...props} />
}
