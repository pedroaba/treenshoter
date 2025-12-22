import { ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '../../lib/cn'
import { ToolbarButton } from '../toolbar-button'

type DetailToolbarProps = {
  onZoomIn: () => void
  onResetZoom: () => void
}

export function DetailToolbar({ onZoomIn, onResetZoom }: DetailToolbarProps) {
  return (
    <div
      className={cn(
        'absolute bottom-5 left-1/2 -translate-x-1/2',
        'flex items-center gap-2 px-3 py-2',
        'bg-zinc-900/95 backdrop-blur-[10px]',
        'border border-zinc-700/50',
        'rounded-xl',
        'shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
        'z-10',
      )}
      id="floating-toolbar"
    >
      <div className="flex items-center gap-1">
        <ToolbarButton
          data-tooltip="Zoom In"
          id="btn-zoom-in"
          onClick={onZoomIn}
        >
          <ZoomIn className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          data-tooltip="Reset Zoom"
          id="btn-reset-zoom"
          onClick={onResetZoom}
        >
          <ZoomOut className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  )
}
