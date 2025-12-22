import { useRef } from 'react'
import { usePreviewScreenshot } from '../components/preview/hooks/use-preview-screenshot'
import {
  PreviewEditor,
  type PreviewEditorRef,
} from '../components/preview/preview-editor'
import { PreviewSidebar } from '../components/preview/preview-sidebar'

export function PreviewScreen() {
  const { screenshot, loading } = usePreviewScreenshot()
  const editorRef = useRef<PreviewEditorRef>(null)

  async function handleCopy() {
    if (!screenshot) return

    const combinedDataUrl = editorRef.current?.getCombinedImageDataUrl()

    try {
      if (combinedDataUrl) {
        await window.api.library.copyScreenshotWithDrawing(combinedDataUrl)
      } else {
        await window.api.library.copyScreenshot(screenshot.filepath)
      }
    } catch (error) {
      console.error('Failed to copy screenshot:', error)
    }
  }

  async function handleSave() {
    if (!screenshot) return

    const combinedDataUrl = editorRef.current?.getCombinedImageDataUrl()

    if (!combinedDataUrl) {
      return
    }

    try {
      await window.api.library.saveScreenshot({
        dataUrl: combinedDataUrl,
        filepath: screenshot.filepath,
      })
    } catch (error) {
      console.error('Failed to save screenshot:', error)
    }
  }

  async function handleSaveAs() {
    if (!screenshot) return

    const combinedDataUrl = editorRef.current?.getCombinedImageDataUrl()

    try {
      if (combinedDataUrl) {
        await window.api.library.saveScreenshotAs(combinedDataUrl)
      } else {
        await window.api.library.saveScreenshotAs(screenshot.filepath)
      }
    } catch (error) {
      console.error('Failed to save screenshot as:', error)
    }
  }

  async function handleShowInFolder() {
    if (!screenshot) return
    try {
      await window.api.library.showScreenshotInFolder(screenshot.filepath)
    } catch (error) {
      console.error('Failed to show in folder:', error)
    }
  }

  async function handleDelete() {
    if (!screenshot) return
    if (!confirm('Are you sure you want to delete this screenshot?')) return

    try {
      await window.api.library.deleteScreenshot(screenshot.id)

      window.close()
    } catch (error) {
      console.error('Failed to delete screenshot:', error)
    }
  }

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!screenshot) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-zinc-400">No screenshot available</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="flex justify-start h-full overflow-hidden">
        <PreviewEditor ref={editorRef} screenshot={screenshot} />
        <PreviewSidebar
          screenshot={screenshot}
          onCopy={handleCopy}
          onSave={handleSave}
          onSaveAs={handleSaveAs}
          onShowInFolder={handleShowInFolder}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
