import { useEffect, useRef, useState } from 'react'

export type DrawingTool =
  | 'pen'
  | 'rectangle'
  | 'circle'
  | 'line'
  | 'arrow'
  | null

type Shape = {
  type: 'rectangle' | 'circle' | 'pen' | 'line' | 'arrow'
  x: number
  y: number
  width?: number
  height?: number
  endX?: number
  endY?: number
  color: string
  size: number
  path?: Array<{ x: number; y: number }>
}

type UsePreviewDrawingReturn = {
  tool: DrawingTool
  setTool: (tool: DrawingTool) => void
  color: string
  setColor: (color: string) => void
  size: number
  setSize: (size: number) => void
  shapes: Shape[]
  clear: () => void
  handleCanvasMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleCanvasMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void
  handleCanvasMouseUp: () => void
  isDrawing: boolean
}

export function usePreviewDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
): UsePreviewDrawingReturn {
  const [tool, setTool] = useState<DrawingTool>('pen')
  const [color, setColor] = useState('#ef4444')
  const [size, setSize] = useState(3)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [isDrawing, setIsDrawing] = useState(false)

  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const currentShapeRef = useRef<Shape | null>(null)

  function getCanvasCoordinates(
    e: React.MouseEvent<HTMLCanvasElement>,
  ): { x: number; y: number } | null {
    if (!canvasRef.current) return null

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    // Get coordinates relative to canvas
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Get computed transform from canvas style
    const transform = window.getComputedStyle(canvas).transform
    if (transform && transform !== 'none') {
      const matrix = new DOMMatrix(transform)
      // Invert the transform to get coordinates in canvas space
      const inverted = matrix.inverse()
      return {
        x: inverted.a * x + inverted.c * y + inverted.e,
        y: inverted.b * x + inverted.d * y + inverted.f,
      }
    }

    return { x, y }
  }

  function drawArrowHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    size: number,
  ) {
    // Lucide-react ArrowRight style: simple, elegant triangular arrowhead
    // Similar to the SVG path used in lucide-react icons
    const headLength = size * 4
    const headWidth = size * 2

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    // Draw triangle pointing right (tip at origin, base behind)
    // This matches the lucide-react ArrowRight icon style
    ctx.beginPath()
    ctx.moveTo(0, 0) // Tip of arrow (pointing right)
    ctx.lineTo(-headLength, -headWidth) // Bottom corner
    ctx.lineTo(-headLength, headWidth) // Top corner
    ctx.closePath() // Closes back to tip
    ctx.fill()

    ctx.restore()
  }

  function drawShape(ctx: CanvasRenderingContext2D, shape: Shape) {
    ctx.strokeStyle = shape.color
    ctx.fillStyle = shape.color
    ctx.lineWidth = shape.size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    if (
      shape.type === 'rectangle' &&
      shape.width !== undefined &&
      shape.height !== undefined
    ) {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
    } else if (
      shape.type === 'circle' &&
      shape.width !== undefined &&
      shape.height !== undefined
    ) {
      const centerX = shape.x + shape.width / 2
      const centerY = shape.y + shape.height / 2
      const radiusX = Math.abs(shape.width) / 2
      const radiusY = Math.abs(shape.height) / 2

      ctx.beginPath()
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
      ctx.stroke()
    } else if (shape.type === 'pen' && shape.path && shape.path.length > 0) {
      ctx.beginPath()
      ctx.moveTo(shape.path[0].x, shape.path[0].y)

      for (let i = 1; i < shape.path.length; i++) {
        ctx.lineTo(shape.path[i].x, shape.path[i].y)
      }

      ctx.stroke()
    } else if (
      shape.type === 'line' &&
      shape.endX !== undefined &&
      shape.endY !== undefined
    ) {
      ctx.beginPath()
      ctx.moveTo(shape.x, shape.y)
      ctx.lineTo(shape.endX, shape.endY)
      ctx.stroke()
    } else if (
      shape.type === 'arrow' &&
      shape.endX !== undefined &&
      shape.endY !== undefined
    ) {
      // Calculate arrow direction and length
      const dx = shape.endX - shape.x
      const dy = shape.endY - shape.y
      const angle = Math.atan2(dy, dx)
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Calculate arrowhead length to stop line before the tip
      const headLength = shape.size * 4

      // Only draw line if there's enough space for the arrowhead
      if (distance > headLength) {
        // Calculate point where line should end (before arrowhead)
        const lineEndX = shape.endX - headLength * Math.cos(angle)
        const lineEndY = shape.endY - headLength * Math.sin(angle)

        // Draw line stopping before arrowhead
        ctx.beginPath()
        ctx.moveTo(shape.x, shape.y)
        ctx.lineTo(lineEndX, lineEndY)
        ctx.stroke()
      }

      // Draw arrow head at the end point
      drawArrowHead(ctx, shape.endX, shape.endY, angle, shape.size)
    }
  }

  function redrawCanvas() {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    shapes.forEach((shape) => {
      drawShape(ctx, shape)
    })

    if (currentShapeRef.current) {
      drawShape(ctx, currentShapeRef.current)
    }
  }

  function handleCanvasMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!tool) {
      return
    }

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    startXRef.current = coords.x
    startYRef.current = coords.y
    setIsDrawing(true)

    if (tool === 'pen') {
      currentShapeRef.current = {
        type: 'pen',
        x: coords.x,
        y: coords.y,
        color,
        size,
        path: [{ x: coords.x, y: coords.y }],
      }
    } else if (tool === 'line' || tool === 'arrow') {
      currentShapeRef.current = {
        type: tool,
        x: coords.x,
        y: coords.y,
        endX: coords.x,
        endY: coords.y,
        color,
        size,
      }
    } else {
      currentShapeRef.current = {
        type: tool === 'rectangle' ? 'rectangle' : 'circle',
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        color,
        size,
      }
    }
  }

  function handleCanvasMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !currentShapeRef.current) return

    const coords = getCanvasCoordinates(e)
    if (!coords) return

    if (currentShapeRef.current.type === 'pen') {
      // Add point to path for free drawing
      if (currentShapeRef.current.path) {
        currentShapeRef.current.path.push({ x: coords.x, y: coords.y })
      }
    } else if (
      currentShapeRef.current.type === 'line' ||
      currentShapeRef.current.type === 'arrow'
    ) {
      // Update end point for line/arrow
      currentShapeRef.current = {
        ...currentShapeRef.current,
        endX: coords.x,
        endY: coords.y,
      }
    } else {
      // Update width/height for rectangle/circle
      const width = coords.x - startXRef.current
      const height = coords.y - startYRef.current

      currentShapeRef.current = {
        ...currentShapeRef.current,
        width,
        height,
      }
    }

    redrawCanvas()
  }

  function handleCanvasMouseUp() {
    if (!isDrawing || !currentShapeRef.current) return

    const shape = currentShapeRef.current

    // Validate shape before saving
    if (shape.type === 'pen') {
      // Save pen path if it has at least 2 points
      if (shape.path && shape.path.length >= 2) {
        setShapes((prev) => [...prev, shape])
      }
    } else if (shape.type === 'line' || shape.type === 'arrow') {
      // Save line/arrow if it has minimum length
      if (
        shape.endX !== undefined &&
        shape.endY !== undefined &&
        (Math.abs(shape.endX - shape.x) > 5 ||
          Math.abs(shape.endY - shape.y) > 5)
      ) {
        setShapes((prev) => [...prev, shape])
      }
    } else if (shape.width !== undefined && shape.height !== undefined) {
      // Save rectangle/circle if it has minimum size
      if (Math.abs(shape.width) > 5 && Math.abs(shape.height) > 5) {
        setShapes((prev) => [...prev, shape])
      }
    }

    currentShapeRef.current = null
    setIsDrawing(false)
    redrawCanvas()
  }

  function clear() {
    setShapes([])
    currentShapeRef.current = null
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
  }

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      redrawCanvas()
    }

    resizeCanvas()

    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas)

    return () => {
      resizeObserver.disconnect()
    }
  }, [canvasRef])

  useEffect(() => {
    redrawCanvas()
  }, [shapes])

  return {
    tool,
    setTool,
    color,
    setColor,
    size,
    setSize,
    shapes,
    clear,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    isDrawing,
  }
}
