import type { ReactNode } from 'react'

type CardOverlayProps = {
	topActions: ReactNode
	bottomActions: ReactNode
}

export function CardOverlay({ topActions, bottomActions }: CardOverlayProps) {
	return (
		<div className="absolute top-0 left-0 w-full h-full bg-black/40 opacity-0 transition-opacity duration-200 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto flex flex-col justify-between p-3">
			<div className="flex justify-end gap-2 pointer-events-auto">{topActions}</div>
			<div className="flex justify-between items-center pointer-events-auto">{bottomActions}</div>
		</div>
	)
}

