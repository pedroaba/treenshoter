import { useState, useRef, useEffect } from 'react'

type CardInfoProps = {
	title: string | null
	id: number
	width: number
	height: number
	timestamp: string
	onTitleUpdate: (newTitle: string) => Promise<void>
}

export function CardInfo({
	title,
	id,
	width,
	height,
	timestamp,
	onTitleUpdate,
}: CardInfoProps) {
	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState(title || '')
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isEditing])

	useEffect(() => {
		setEditValue(title || '')
	}, [title])

	const displayTitle = title || `Screenshot #${id}`
	const dateStr = new Date(`${timestamp}Z`).toLocaleDateString()

	const handleSave = async () => {
		const newTitle = editValue.trim()
		if (newTitle !== title) {
			await onTitleUpdate(newTitle)
		}
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			handleSave()
		}
		if (e.key === 'Escape') {
			setEditValue(title || '')
			setIsEditing(false)
		}
	}

	if (isEditing) {
		return (
			<div className="p-3 bg-zinc-900">
				<input
					ref={inputRef}
					type="text"
					className="w-full bg-transparent border-none text-white text-xl font-medium font-inherit outline-none p-0 m-0 border-b border-blue-500"
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onBlur={handleSave}
					onKeyDown={handleKeyDown}
					placeholder={`Screenshot #${id}`}
				/>
				<div className="text-sm text-zinc-400 flex justify-between mt-1">
					<span>
						{width} x {height}
					</span>
					<span>{dateStr}</span>
				</div>
			</div>
		)
	}

	return (
		<div className="p-3 bg-zinc-900">
			<div
				className="text-xl font-medium text-white mb-1 whitespace-nowrap overflow-hidden text-ellipsis cursor-text hover:underline hover:decoration-zinc-500"
				title="Click to edit"
				onClick={() => {
					setIsEditing(true)
					setEditValue(title || '')
				}}
			>
				{displayTitle}
			</div>
			<div className="text-sm text-zinc-400 flex justify-between">
				<span>
					{width} x {height}
				</span>
				<span>{dateStr}</span>
			</div>
		</div>
	)
}

