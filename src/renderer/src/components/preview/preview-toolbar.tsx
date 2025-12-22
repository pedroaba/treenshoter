import {
  ArrowRight,
  Circle,
  Minus,
  Pencil,
  RefreshCw,
  Square,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { ToolbarButton } from '../toolbar-button'
import { Separator } from '../ui/separator'
import type { DrawingTool } from './hooks/use-preview-drawing'

type PreviewToolbarProps = {
  tool: DrawingTool
  onToolChange: (tool: DrawingTool) => void
  color: string
  onColorChange: (color: string) => void
  size: number
  onSizeChange: (size: number) => void
  onClear: () => void
  onZoomIn: () => void
  onResetZoom: () => void
}

export function PreviewToolbar({
  tool,
  onToolChange,
  onClear,
  onZoomIn,
  onResetZoom,
}: PreviewToolbarProps) {
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
          data-tool="pen"
          data-tooltip="Pen (P)"
          data-active={tool === 'pen'}
          onClick={() => onToolChange('pen')}
        >
          <Pencil className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          data-tool="rectangle"
          data-tooltip="Rectangle (R)"
          data-active={tool === 'rectangle'}
          onClick={() => onToolChange('rectangle')}
        >
          <Square className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          data-tool="circle"
          data-tooltip="Circle (O)"
          data-active={tool === 'circle'}
          onClick={() => onToolChange('circle')}
        >
          <Circle className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          className="toolbar-btn"
          data-tool="line"
          data-tooltip="Line (L)"
          data-active={tool === 'line'}
          onClick={() => onToolChange('line')}
        >
          <Minus className="size-6 -rotate-60" />
        </ToolbarButton>
        <ToolbarButton
          className="toolbar-btn"
          data-tool="arrow"
          data-tooltip="Arrow (A)"
          data-active={tool === 'arrow'}
          onClick={() => onToolChange('arrow')}
        >
          <ArrowRight className="size-4" />
        </ToolbarButton>
      </div>

      <Separator className="h-6 w-0.5" />

      <div className="flex items-center gap-1">
        <ToolbarButton
          data-tool="clear"
          data-tooltip="Clear Canvas"
          id="toolbar-clear-btn"
          onClick={onClear}
        >
          <RefreshCw className="size-4" />
        </ToolbarButton>
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
