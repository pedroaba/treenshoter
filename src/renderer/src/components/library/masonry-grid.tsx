import type { ReactNode } from 'react'
import './masonry-grid.css'

type MasonryGridProps = {
	children: ReactNode
}

export function MasonryGrid({ children }: MasonryGridProps) {
	return (
		<div className="masonry-grid px-5 pb-5">
			{children}
		</div>
	)
}

