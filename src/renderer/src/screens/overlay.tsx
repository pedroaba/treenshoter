import { useEffect, useRef, useState } from 'react'
import { cn } from '../lib/cn'
import { PrintScreenMode } from '../../../shared/enum/print-screen-mode'
import { CircleDot } from '../components/circle-dot'

type Selection = {
  x: number
  y: number
  width: number
  height: number
} | null

export function OverlayScreen() {
  const [currentMode, setCurrentMode] = useState<PrintScreenMode | null>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selection, setSelection] = useState<Selection>(null)
  const startPointRef = useRef<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  function handleClickOnOverlay() {
    if (!currentMode) {
      window.api.global.notify({
        title: 'No mode selected',
        body: 'Please select a mode in the dock.',
      })

      return
    }

    if (currentMode === PrintScreenMode.FULLSCREEN) {
      window.api.print.takeFullScreenshot()
      return
    }

    if (currentMode === PrintScreenMode.PARTIAL_SCREEN) {
      return
    }

    window.api.global.notify({
      title: 'No mode selected or mode not supported',
      body: 'Please select a mode in the dock.',
    })
  }

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (currentMode !== PrintScreenMode.PARTIAL_SCREEN) {
      return
    }

    if (e.button !== 0) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsSelecting(true)
    startPointRef.current = { x, y }
    setSelection({ x, y, width: 0, height: 0 })
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isSelecting || !startPointRef.current) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const startX = startPointRef.current.x
    const startY = startPointRef.current.y

    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    setSelection({ x, y, width, height })
  }

  function handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if (!isSelecting || !startPointRef.current) {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const startX = startPointRef.current.x
    const startY = startPointRef.current.y

    const x = Math.min(startX, currentX)
    const y = Math.min(startY, currentY)
    const width = Math.abs(currentX - startX)
    const height = Math.abs(currentY - startY)

    const minSize = 10
    if (width < minSize || height < minSize) {
      setIsSelecting(false)
      setSelection(null)
      startPointRef.current = null
      return
    }

    const finalSelection = { x, y, width, height }
    window.api.print.takePartialScreenshot(finalSelection)

    setIsSelecting(false)
    setSelection(null)
    startPointRef.current = null
  }

  useEffect(() => {
    window.api.state.onReadyToTakePrint((mode) => {
      setCurrentMode(mode)
    })

    window.api.state.onModeChanged((mode) => {
      setCurrentMode(mode)
    })
  }, [])

  const showSelection =
    currentMode === PrintScreenMode.PARTIAL_SCREEN && selection

  return (
    <div className="absolute top-0 left-0 w-full h-full">
      {showSelection ? (
        <>
          {/* Top overlay */}
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{
              top: 0,
              left: 0,
              width: '100%',
              height: `${selection.y}px`,
            }}
          />
          {/* Bottom overlay */}
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{
              top: `${selection.y + selection.height}px`,
              left: 0,
              width: '100%',
              height: `calc(100% - ${selection.y + selection.height}px)`,
            }}
          />
          {/* Left overlay */}
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{
              top: `${selection.y}px`,
              left: 0,
              width: `${selection.x}px`,
              height: `${selection.height}px`,
            }}
          />
          {/* Right overlay */}
          <div
            className="absolute bg-black/50 pointer-events-none"
            style={{
              top: `${selection.y}px`,
              left: `${selection.x + selection.width}px`,
              width: `calc(100% - ${selection.x + selection.width}px)`,
              height: `${selection.height}px`,
            }}
          />
          {/* Selection border */}
          <div
            className="absolute border-2 border-dashed border-blue-500 pointer-events-none"
            style={{
              left: `${selection.x}px`,
              top: `${selection.y}px`,
              width: `${selection.width}px`,
              height: `${selection.height}px`,
              backgroundColor: 'transparent',
            }}
          >
            {/* Corner dots for resize indication */}
            <CircleDot variant="top-left" />
            <CircleDot variant="top-right" />
            <CircleDot variant="bottom-left" />
            <CircleDot variant="bottom-right" />
          </div>
        </>
      ) : (
        <div className="absolute top-0 left-0 w-full h-full bg-black/50 pointer-events-none" />
      )}
      <div
        ref={containerRef}
        className={cn(
          'absolute top-0 left-0',
          'w-full h-full',
          'pointer-events-auto',
          'flex flex-col justify-between p-3',
          currentMode === PrintScreenMode.PARTIAL_SCREEN && 'cursor-crosshair',
        )}
        onClick={handleClickOnOverlay}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  )
}
