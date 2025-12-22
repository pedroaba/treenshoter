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

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
) {
  const headLength = size * 4
  const headWidth = size * 2

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-headLength, -headWidth)
  ctx.lineTo(-headLength, headWidth)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  scaleX: number,
  scaleY: number,
) {
  ctx.strokeStyle = shape.color
  ctx.fillStyle = shape.color
  ctx.lineWidth = shape.size * Math.min(scaleX, scaleY)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (
    shape.type === 'rectangle' &&
    shape.width !== undefined &&
    shape.height !== undefined
  ) {
    ctx.strokeRect(
      shape.x * scaleX,
      shape.y * scaleY,
      shape.width * scaleX,
      shape.height * scaleY,
    )
  } else if (
    shape.type === 'circle' &&
    shape.width !== undefined &&
    shape.height !== undefined
  ) {
    const centerX = (shape.x + shape.width / 2) * scaleX
    const centerY = (shape.y + shape.height / 2) * scaleY
    const radiusX = (Math.abs(shape.width) / 2) * scaleX
    const radiusY = (Math.abs(shape.height) / 2) * scaleY

    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
    ctx.stroke()
  } else if (shape.type === 'pen' && shape.path && shape.path.length > 0) {
    ctx.beginPath()
    ctx.moveTo(shape.path[0].x * scaleX, shape.path[0].y * scaleY)

    for (let i = 1; i < shape.path.length; i++) {
      ctx.lineTo(shape.path[i].x * scaleX, shape.path[i].y * scaleY)
    }

    ctx.stroke()
  } else if (
    shape.type === 'line' &&
    shape.endX !== undefined &&
    shape.endY !== undefined
  ) {
    ctx.beginPath()
    ctx.moveTo(shape.x * scaleX, shape.y * scaleY)
    ctx.lineTo(shape.endX * scaleX, shape.endY * scaleY)
    ctx.stroke()
  } else if (
    shape.type === 'arrow' &&
    shape.endX !== undefined &&
    shape.endY !== undefined
  ) {
    const dx = (shape.endX - shape.x) * scaleX
    const dy = (shape.endY - shape.y) * scaleY
    const angle = Math.atan2(dy, dx)
    const distance = Math.sqrt(dx * dx + dy * dy)

    const scaledSize = shape.size * Math.min(scaleX, scaleY)
    const headLength = scaledSize * 4

    if (distance > headLength) {
      const lineEndX = shape.endX * scaleX - headLength * Math.cos(angle)
      const lineEndY = shape.endY * scaleY - headLength * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(shape.x * scaleX, shape.y * scaleY)
      ctx.lineTo(lineEndX, lineEndY)
      ctx.stroke()
    }

    drawArrowHead(
      ctx,
      shape.endX * scaleX,
      shape.endY * scaleY,
      angle,
      scaledSize,
    )
  }
}

export function combineImageWithDrawing(
  image: HTMLImageElement,
  drawingCanvas: HTMLCanvasElement,
  shapes: Shape[],
): string {
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')

  if (!tempCtx) {
    throw new Error('Failed to get 2d context')
  }

  const imageWidth = image.naturalWidth || image.width
  const imageHeight = image.naturalHeight || image.height

  tempCanvas.width = imageWidth
  tempCanvas.height = imageHeight

  tempCtx.drawImage(image, 0, 0, imageWidth, imageHeight)

  if (shapes.length > 0) {
    const canvasWidth = drawingCanvas.width
    const canvasHeight = drawingCanvas.height

    const scaleX = imageWidth / canvasWidth
    const scaleY = imageHeight / canvasHeight

    shapes.forEach((shape) => {
      drawShape(tempCtx, shape, scaleX, scaleY)
    })
  }

  return tempCanvas.toDataURL('image/png')
}
