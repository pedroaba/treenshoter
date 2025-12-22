import { Separator } from '../components/ui/separator'
import { DockButton } from '../components/dock/button'
import { BookOpen, Fullscreen, ScanEye, Settings } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import { GlobalsIPC } from '../../../shared/communication/ipc/globals'
import { PrintScreenMode } from '../../../shared/enum/print-screen-mode'

export function Dock() {
  const [currentMode, setCurrentMode] = useState<PrintScreenMode>(
    PrintScreenMode.FULLSCREEN,
  )
  const [isFetchingCurrentMode, startLoadingCurrentMode] = useTransition()

  function handleOpenSettingsScreen() {
    window.api.dock.openSettingsScreen()
  }

  function handleOpenLibraryScreen() {
    window.api.dock.openLibraryScreen()
  }

  function handleSetFullscreenPrint() {
    window.api.print
      .setFullscreenPrint()
      .then(() => setCurrentMode(PrintScreenMode.FULLSCREEN))
  }

  function handleSetPartialScreenPrint() {
    window.api.print
      .setPartialScreenPrint()
      .then(() => setCurrentMode(PrintScreenMode.PARTIAL_SCREEN))
  }

  function dispatchReadyToTakePrint(mode: PrintScreenMode) {
    window.electron.ipcRenderer.send(GlobalsIPC.READY_TO_TAKE_PRINT, {
      mode,
    })
  }

  useEffect(() => {
    startLoadingCurrentMode(async () => {
      let mode = PrintScreenMode.FULLSCREEN

      try {
        const currentMode = await window.api.print.getCurrentMode()
        mode = currentMode as PrintScreenMode
      } catch {
        mode = PrintScreenMode.FULLSCREEN
        handleSetFullscreenPrint()
      } finally {
        dispatchReadyToTakePrint(mode)
        setCurrentMode(mode)
      }
    })
  }, [])

  return (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-zinc-800/60 shadow-2xl">
        <DockButton
          data-state={
            currentMode === PrintScreenMode.FULLSCREEN ? 'selected' : ''
          }
          disabled={isFetchingCurrentMode}
          title="Fullscreen"
          onClick={handleSetFullscreenPrint}
        >
          <Fullscreen className="size-4" />
        </DockButton>
        <DockButton
          data-state={
            currentMode === PrintScreenMode.PARTIAL_SCREEN ? 'selected' : ''
          }
          disabled={isFetchingCurrentMode}
          title="PartialScreen"
          onClick={handleSetPartialScreenPrint}
        >
          <ScanEye className="size-4" />
        </DockButton>
        <Separator />
        <DockButton title="Library" onClick={handleOpenLibraryScreen}>
          <BookOpen className="size-4" />
        </DockButton>
        <DockButton title="Settings" onClick={handleOpenSettingsScreen}>
          <Settings className="size-4" />
        </DockButton>
      </div>
    </div>
  )
}
