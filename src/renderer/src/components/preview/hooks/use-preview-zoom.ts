import { useEffect, useRef, useState } from 'react'

type UsePreviewZoomReturn = {
  zoomLevel: number
  isDragging: boolean
  applyTransform: (zoom: number, panX: number, panY: number) => void
  handleZoomIn: () => void
  handleResetZoom: () => void
  handleMouseDown: (e: React.MouseEvent) => void
  handleMouseMove: (e: React.MouseEvent) => void
  handleMouseUp: () => void
  handleMouseLeave: () => void
  imageRef: React.RefObject<HTMLImageElement | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}

export function usePreviewZoom(screenshot?: unknown): UsePreviewZoomReturn {
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const zoomLevelRef = useRef<number>(1)
  const panXRef = useRef<number>(0)
  const panYRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const dragStartXRef = useRef<number>(0)
  const dragStartYRef = useRef<number>(0)
  const dragStartPanXRef = useRef<number>(0)
  const dragStartPanYRef = useRef<number>(0)

  const [isDragging, setIsDragging] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  function applyTransform(zoom: number, panX: number, panY: number) {
    if (!imageRef.current) {
      return
    }

    zoomLevelRef.current = zoom
    panXRef.current = panX
    panYRef.current = panY
    setZoomLevel(zoom)

    const transform = `translate(${panX}px, ${panY}px) scale(${zoom})`
    imageRef.current.style.transform = transform
    if (canvasRef.current) {
      canvasRef.current.style.transform = transform
    }
  }

  function applyZoom(zoom: number) {
    applyTransform(zoom, panXRef.current, panYRef.current)
  }

  function handleZoomIn() {
    const newZoom = Math.min(zoomLevelRef.current * 1.2, 5)
    applyZoom(newZoom)
  }

  function handleResetZoom() {
    applyTransform(1, 0, 0)
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (zoomLevelRef.current <= 1) {
      return
    }

    isDraggingRef.current = true
    setIsDragging(true)
    dragStartXRef.current = e.clientX
    dragStartYRef.current = e.clientY
    dragStartPanXRef.current = panXRef.current
    dragStartPanYRef.current = panYRef.current

    if (imageRef.current) {
      imageRef.current.style.transition = 'none'
      if (canvasRef.current) {
        canvasRef.current.style.transition = 'none'
      }
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDraggingRef.current || zoomLevelRef.current <= 1) {
      return
    }

    const deltaX = e.clientX - dragStartXRef.current
    const deltaY = e.clientY - dragStartYRef.current

    const newPanX = dragStartPanXRef.current + deltaX
    const newPanY = dragStartPanYRef.current + deltaY

    applyTransform(zoomLevelRef.current, newPanX, newPanY)
  }

  function handleMouseUp() {
    if (!isDraggingRef.current) {
      return
    }

    isDraggingRef.current = false
    setIsDragging(false)

    if (imageRef.current) {
      imageRef.current.style.transition = 'transform 200ms ease-out'
      if (canvasRef.current) {
        canvasRef.current.style.transition = 'transform 200ms ease-out'
      }
    }
  }

  function handleMouseLeave() {
    if (isDraggingRef.current) {
      handleMouseUp()
    }
  }

  useEffect(() => {
    function handleGlobalMouseMove(e: MouseEvent) {
      if (isDraggingRef.current && zoomLevelRef.current > 1) {
        const deltaX = e.clientX - dragStartXRef.current
        const deltaY = e.clientY - dragStartYRef.current

        const newPanX = dragStartPanXRef.current + deltaX
        const newPanY = dragStartPanYRef.current + deltaY

        applyTransform(zoomLevelRef.current, newPanX, newPanY)
      }
    }

    function handleGlobalMouseUp() {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        setIsDragging(false)

        if (imageRef.current) {
          imageRef.current.style.transition = 'transform 200ms ease-out'
          if (canvasRef.current) {
            canvasRef.current.style.transition = 'transform 200ms ease-out'
          }
        }
      }
    }

    window.addEventListener('mousemove', handleGlobalMouseMove)
    window.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove)
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  useEffect(() => {
    if (screenshot && imageRef.current) {
      applyTransform(1, 0, 0)
    }
  }, [screenshot])

  return {
    zoomLevel,
    isDragging,
    applyTransform,
    handleZoomIn,
    handleResetZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    imageRef,
    canvasRef,
  }
}
