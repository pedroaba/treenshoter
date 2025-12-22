import type { Screenshot } from '../../../../shared/types/screenshot'
import { usePreviewZoom } from '../preview/hooks/use-preview-zoom'
import { DetailToolbar } from './detail-toolbar'

type DetailEditorProps = {
  screenshot: Screenshot
}

export function DetailEditor({ screenshot }: DetailEditorProps) {
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
  } = usePreviewZoom(screenshot)

  const imgUrl = `media://${screenshot.filepath}`
  const displayTitle = screenshot.title || `Screenshot #${screenshot.id}`

  function handleContainerMouseDown(e: React.MouseEvent) {
    if (zoomLevel > 1) {
      handleZoomMouseDown(e)
    }
  }

  function handleContainerMouseMove(e: React.MouseEvent) {
    if (isZoomDragging && zoomLevel > 1) {
      handleZoomMouseMove(e)
    }
  }

  function handleContainerMouseUp() {
    handleZoomMouseUp()
  }

  function handleContainerMouseLeave() {
    handleZoomMouseLeave()
  }

  const cursor = isZoomDragging
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
          id="detail-image"
          className="object-cover transition-transform duration-200 ease-out select-none"
          style={{ transformOrigin: 'center' }}
          src={imgUrl}
          alt={displayTitle}
          ref={imageRef}
          draggable={false}
        />
      </div>
      <DetailToolbar onZoomIn={handleZoomIn} onResetZoom={handleResetZoom} />
    </div>
  )
}
