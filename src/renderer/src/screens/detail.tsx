import { useDetailScreenshot } from '../components/detail/hooks/use-detail-screenshot'
import { DetailEditor } from '../components/detail/detail-editor'
import { PreviewSidebar } from '../components/preview/preview-sidebar'

export function DetailScreen() {
  const { screenshot, loading } = useDetailScreenshot()

  async function handleCopy() {
    if (!screenshot) return

    try {
      await window.api.library.copyScreenshot(screenshot.filepath)
    } catch (error) {
      console.error('Failed to copy screenshot:', error)
    }
  }

  async function handleSave() {
    if (!screenshot) return
    // Detail screen doesn't have drawing, so save is not applicable
    // This handler is kept for consistency with PreviewSidebar interface
  }

  async function handleSaveAs() {
    if (!screenshot) return

    try {
      await window.api.library.saveScreenshotAs(screenshot.filepath)
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
        <DetailEditor screenshot={screenshot} />
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
