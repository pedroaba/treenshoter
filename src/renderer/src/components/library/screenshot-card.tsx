import { useState } from 'react'
import type { Screenshot } from '../../../../shared/types/screenshot'
import { ActionButton } from './action-button'
import { CardInfo } from './card-info'
import { CardOverlay } from './card-overlay'

type ScreenshotCardProps = {
  screenshot: Screenshot
  onDelete: (id: number) => Promise<void>
  onTitleUpdate: (id: number, title: string) => Promise<void>
  onSaveAs: (filepath: string) => Promise<void>
  onCopy: (filepath: string) => Promise<void>
  onShowInFolder: (filepath: string) => Promise<void>
  onOpenDetail: (id: number) => Promise<void>
}

const SaveIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
)

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
)

const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
)

const DeleteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
)

export function ScreenshotCard({
  screenshot,
  onDelete,
  onTitleUpdate,
  onSaveAs,
  onCopy,
  onShowInFolder,
  onOpenDetail,
}: ScreenshotCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this screenshot?')) {
      setIsDeleting(true)
      await onDelete(screenshot.id)
      setIsDeleting(false)
    }
  }

  const displayTitle = screenshot.title || `Screenshot #${screenshot.id}`
  const imgUrl = `media://${screenshot.filepath}`

  return (
    <div className="group relative rounded-xl overflow-hidden bg-zinc-900 transition-transform duration-200 border border-zinc-800 hover:border-zinc-600">
      <div className="relative" onClick={() => onOpenDetail(screenshot.id)}>
        <img
          src={imgUrl}
          loading="lazy"
          alt={displayTitle}
          className="w-full block cursor-pointer"
        />
        <CardOverlay
          topActions={
            <>
              <ActionButton
                title="Save As"
                icon={<SaveIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  onSaveAs(screenshot.filepath)
                }}
              />
              <ActionButton
                title="Copy to Clipboard"
                icon={<CopyIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  onCopy(screenshot.filepath)
                }}
              />
            </>
          }
          bottomActions={
            <>
              <ActionButton
                title="Show in Folder"
                icon={<FolderIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  onShowInFolder(screenshot.filepath)
                }}
              />
              <ActionButton
                variant="delete"
                title="Delete"
                icon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                disabled={isDeleting}
              />
            </>
          }
        />
      </div>
      <CardInfo
        title={screenshot.title}
        id={screenshot.id}
        width={screenshot.width}
        height={screenshot.height}
        timestamp={screenshot.timestamp}
        onTitleUpdate={async (newTitle) => {
          await onTitleUpdate(screenshot.id, newTitle)
        }}
      />
    </div>
  )
}
