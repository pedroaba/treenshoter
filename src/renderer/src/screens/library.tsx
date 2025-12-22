import { Camera } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Header } from '../components/library/header'
import { MasonryGrid } from '../components/library/masonry-grid'
import { ScreenshotCard } from '../components/library/screenshot-card'
import { SetTitleUtils } from '../utils/set-title'
import type { Screenshot } from '../../../shared/types/screenshot'

export function LibraryScreen() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(true)

  async function loadScreenshots(): Promise<void> {
    try {
      setLoading(true)
      const data = await window.api.library.getLibrary()

      setScreenshots(data)
    } catch (error) {
      console.error('Failed to load screenshots:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      await window.api.library.deleteScreenshot(id)
      setScreenshots((prev) => prev.filter((s) => s.id !== id))
    } catch (error) {
      console.error('Failed to delete screenshot:', error)
    }
  }

  async function handleTitleUpdate(id: number, title: string): Promise<void> {
    try {
      await window.api.library.updateScreenshotTitle(id, title)
      setScreenshots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title } : s)),
      )
    } catch (error) {
      console.error('Failed to update title:', error)
    }
  }

  async function handleSaveAs(filepath: string): Promise<void> {
    try {
      await window.api.library.saveScreenshotAs(filepath)
    } catch (error) {
      console.error('Failed to save screenshot:', error)
    }
  }

  async function handleCopy(filepath: string): Promise<void> {
    try {
      await window.api.library.copyScreenshot(filepath)
    } catch (error) {
      console.error('Failed to copy screenshot:', error)
    }
  }

  async function handleShowInFolder(filepath: string): Promise<void> {
    try {
      await window.api.library.showScreenshotInFolder(filepath)
    } catch (error) {
      console.error('Failed to show in folder:', error)
    }
  }

  async function handleOpenDetail(id: number): Promise<void> {
    try {
      await window.api.library.openImageDetail(id)
    } catch (error) {
      console.error('Failed to open detail:', error)
    }
  }

  useEffect(() => {
    SetTitleUtils.set('Library - Screenshoter')
    loadScreenshots()
  }, [])

  if (loading) {
    return (
      <div className="bg-zinc-950 text-white w-screen h-screen overflow-y-auto">
        <Header />
        <div className="px-5 pb-5">
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-zinc-950 text-white w-screen h-screen overflow-y-auto custom-scrollbar">
      <Header />
      {screenshots.length === 0 ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] px-5 pb-5">
          <div className="flex flex-col items-center justify-center text-center max-w-md">
            <div className="mb-6 p-6 rounded-full bg-zinc-900/50 border border-zinc-800">
              <Camera className="size-12 text-zinc-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              No screenshots yet
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-1">
              Your screenshot library is empty. Start capturing your screen to
              see your screenshots here.
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              Use the global keyboard shortcut to take a screenshot
            </p>
          </div>
        </div>
      ) : (
        <MasonryGrid>
          {screenshots.map((screenshot) => (
            <ScreenshotCard
              key={screenshot.id}
              screenshot={screenshot}
              onDelete={handleDelete}
              onTitleUpdate={handleTitleUpdate}
              onSaveAs={handleSaveAs}
              onCopy={handleCopy}
              onShowInFolder={handleShowInFolder}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </MasonryGrid>
      )}
    </div>
  )
}
