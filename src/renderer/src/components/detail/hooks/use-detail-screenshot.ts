import { useEffect, useState, useTransition } from 'react'
import type { Screenshot } from '../../../../../shared/types/screenshot'
import { SetTitleUtils } from '../../../utils/set-title'
import { FileUtils } from '../../../utils/file'

export function useDetailScreenshot() {
  const [screenshot, setScreenshot] = useState<Screenshot | null>(null)
  const [loading, startLoadingScreenshot] = useTransition()

  useEffect(() => {
    SetTitleUtils.set('Detail - Screenshoter')

    startLoadingScreenshot(async function loadScreenshot() {
      try {
        const imageId = await window.api.library.getDetailImageId()

        if (imageId === null) {
          console.error('No detail image ID available')
          return
        }

        const data = await window.api.library.getScreenshotById(imageId)
        setScreenshot(data || null)
        if (data) {
          SetTitleUtils.set(FileUtils.getFilename(data?.filepath || ''))
        }
      } catch (error) {
        console.error('Failed to load screenshot:', error)
      }
    })
  }, [])

  return { screenshot, loading }
}
