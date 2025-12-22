import { cn } from '../../lib/cn'
import type { ComponentProps } from 'react'

type ActionButtonProps = ComponentProps<'button'> & {
	variant?: 'default' | 'delete'
	title: string
	icon: React.ReactNode
}

export function ActionButton({
	variant = 'default',
	title,
	icon,
	className,
	...rest
}: ActionButtonProps) {
	return (
		<button
			className={cn(
				'w-8 h-8 rounded-full border-none bg-white text-black',
				'flex items-center justify-center cursor-pointer',
				'transition-all duration-200 ease-in-out',
				'shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
				'hover:bg-zinc-100 hover:scale-105',
				'active:scale-95',
				variant === 'delete' && 'hover:bg-red-500 hover:text-white',
				className,
			)}
			title={title}
			{...rest}
		>
			{icon}
		</button>
	)
}

