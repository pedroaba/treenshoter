import { forwardRef, useImperativeHandle } from 'react'
import type { Screenshot } from '../../../../shared/types/screenshot'
import { usePreviewZoom } from './hooks/use-preview-zoom'
import { usePreviewDrawing } from './hooks/use-preview-drawing'
import { PreviewToolbar } from './preview-toolbar'
import { combineImageWithDrawing } from '../../utils/combine-image-with-drawing'

type PreviewEditorProps = {
  screenshot: Screenshot
}

export type PreviewEditorRef = {
  getCombinedImageDataUrl: () => string | null
}

export const PreviewEditor = forwardRef<PreviewEditorRef, PreviewEditorProps>(
  function PreviewEditor({ screenshot }, ref) {
    const {
      zoomLevel,
      isDragging: isZoomDragging,
      handleMouseDown: handleZoomMouseDown,
      handleMouseMove: handleZoomMouseMove,
      handleMouseUp: handleZoomMouseUp,
      handleMouseLeave: handleZoomMouseLeave,
      handleZoomIn,
      handleResetZoom,
      imageRef,
      canvasRef,
    } = usePreviewZoom(screenshot)

    const {
      tool,
      setTool,
      color,
      setColor,
      size,
      setSize,
      clear,
      handleCanvasMouseDown,
      handleCanvasMouseMove,
      handleCanvasMouseUp,
      isDrawing,
      shapes,
    } = usePreviewDrawing(canvasRef)

    const imgUrl = `media://${screenshot.filepath}`
    const displayTitle = screenshot.title || `Screenshot #${screenshot.id}`

    useImperativeHandle(ref, () => ({
      getCombinedImageDataUrl: () => {
        if (!imageRef.current || !canvasRef.current) {
          return null
        }

        if (shapes.length === 0) {
          return null
        }

        try {
          return combineImageWithDrawing(
            imageRef.current,
            canvasRef.current,
            shapes,
          )
        } catch (error) {
          console.error('Failed to combine image with drawing:', error)
          return null
        }
      },
    }))

    function handleContainerMouseDown(e: React.MouseEvent) {
      if (
        tool &&
        (tool === 'rectangle' ||
          tool === 'circle' ||
          tool === 'pen' ||
          tool === 'line' ||
          tool === 'arrow')
      ) {
        handleCanvasMouseDown(e as React.MouseEvent<HTMLCanvasElement>)
      } else if (zoomLevel > 1) {
        handleZoomMouseDown(e)
      }
    }

    function handleContainerMouseMove(e: React.MouseEvent) {
      if (isDrawing) {
        handleCanvasMouseMove(e as React.MouseEvent<HTMLCanvasElement>)
      } else if (isZoomDragging && zoomLevel > 1) {
        handleZoomMouseMove(e)
      }
    }

    function handleContainerMouseUp() {
      if (isDrawing) {
        handleCanvasMouseUp()
      } else {
        handleZoomMouseUp()
      }
    }

    function handleContainerMouseLeave() {
      if (isDrawing) {
        handleCanvasMouseUp()
      } else {
        handleZoomMouseLeave()
      }
    }

    const cursor =
      isDrawing ||
      (tool &&
        (tool === 'rectangle' ||
          tool === 'circle' ||
          tool === 'pen' ||
          tool === 'line' ||
          tool === 'arrow'))
        ? 'crosshair'
        : isZoomDragging
          ? 'grabbing'
          : zoomLevel > 1
            ? 'grab'
            : 'default'

    return (
      <div className="relative h-screen grow overflow-hidden">
        <div
          className="flex items-center justify-center h-full overflow-hidden"
          onMouseDown={handleContainerMouseDown}
          onMouseMove={handleContainerMouseMove}
          onMouseUp={handleContainerMouseUp}
          onMouseLeave={handleContainerMouseLeave}
          style={{ cursor }}
        >
          <img
            id="preview-image"
            className="object-cover transition-transform duration-200 ease-out select-none"
            style={{ transformOrigin: 'center' }}
            src={imgUrl}
            alt={displayTitle}
            ref={imageRef}
            draggable={false}
          />
          <canvas
            id="drawing-canvas"
            className="absolute top-0 left-0 w-full h-full touch-none transition-transform duration-200 ease-out"
            style={{ transformOrigin: 'center' }}
            ref={canvasRef}
          />
        </div>
        <PreviewToolbar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          size={size}
          onSizeChange={setSize}
          onClear={clear}
          onZoomIn={handleZoomIn}
          onResetZoom={handleResetZoom}
        />
      </div>
    )
  },
)
