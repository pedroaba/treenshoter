import { cn } from '../lib/cn'
import type { ComponentProps } from 'react'

type TabButtonProps = ComponentProps<'button'> & {
  isCurrentTab?: boolean
}

export function TabButton({
  className,
  isCurrentTab = false,
  ...rest
}: TabButtonProps) {
  return (
    <button
      data-is-current-tab={isCurrentTab}
      className={cn(
        'w-full bg-zinc-900/70 p-2 rounded-md text-zinc-300 cursor-pointer',
        'data-[is-current-tab=true]:bg-zinc-900 data-[is-current-tab=true]:text-zinc-50',
        className,
      )}
      {...rest}
    />
  )
}
