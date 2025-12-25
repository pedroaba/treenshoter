import { contextBridge, ipcRenderer } from 'electron'
import { LibraryIPC } from '../shared/communication/ipc/library'
import {
  SettingsIPC,
  SettingsIPCGetConfigsRequest,
  SettingsIPCGetConfigsResponse,
} from '../shared/communication/ipc/settings'
import type { Screenshot } from '../shared/types/screenshot'
import { PrintIPC } from '../shared/communication/ipc/print'
import { DockIPC } from '../shared/communication/ipc/dock'
import type { PrintScreenMode } from '../shared/enum/print-screen-mode'
import { GlobalsIPC } from '../shared/communication/ipc/globals'

type NotifyParams = {
  title: string
  body: string
}

export type TreenshoterAPI = {
  global: {
    escape: () => void
    notify: (params: NotifyParams) => Promise<void>
    setTitle: (title: string) => void
    readyToTakePrint: (mode: PrintScreenMode) => void
  }
  settings: {
    fetchSpecific: (
      params: SettingsIPCGetConfigsRequest,
    ) => Promise<SettingsIPCGetConfigsResponse>
    selectFolder: () => Promise<{ directory: string } | null>
    setNewSettings: (settings: { default_save_directory: string }) => void
  }
  library: {
    getLibrary: () => Promise<Screenshot[]>
    getScreenshotById: (id: number) => Promise<Screenshot | undefined>
    getPreviewImageId: () => Promise<number | null>
    getDetailImageId: () => Promise<number | null>
    deleteScreenshot: (id: number) => Promise<boolean>
    updateScreenshotTitle: (id: number, title: string) => Promise<boolean>
    saveScreenshotAs: (filepathOrDataUrl: string) => Promise<boolean>
    saveScreenshot: (params: {
      dataUrl: string
      filepath: string
    }) => Promise<boolean>
    copyScreenshot: (filepath: string) => Promise<boolean>
    copyScreenshotWithDrawing: (dataUrl: string) => Promise<boolean>
    showScreenshotInFolder: (filepath: string) => Promise<void>
    openImageDetail: (id: number) => Promise<void>
  }
  print: {
    setFullscreenPrint: () => Promise<void>
    setPartialScreenPrint: () => Promise<void>
    getCurrentMode: () => Promise<PrintScreenMode>

    takeFullScreenshot: () => Promise<void>
    takePartialScreenshot: (selection: {
      x: number
      y: number
      width: number
      height: number
    }) => Promise<void>
  }
  dock: {
    openSettingsScreen: () => Promise<void>
    openLibraryScreen: () => Promise<void>
  }
  state: {
    onReadyToTakePrint: (callback: (mode: PrintScreenMode) => void) => void
    onModeChanged: (callback: (mode: PrintScreenMode) => void) => void
  }
}

declare global {
  export interface Window {
    api: TreenshoterAPI
  }
}

const api = {
  global: {
    escape: () => {
      return ipcRenderer.send(GlobalsIPC.ESCAPE)
    },
    notify: async (params: NotifyParams) => {
      return await ipcRenderer.invoke(GlobalsIPC.NOTIFY, params)
    },
    setTitle: (title: string) => {
      return ipcRenderer.send(GlobalsIPC.SET_TITLE, {
        title,
      })
    },
    readyToTakePrint: (mode: PrintScreenMode) => {
      return ipcRenderer.send(GlobalsIPC.READY_TO_TAKE_PRINT, {
        mode,
      })
    },
  },
  settings: {
    fetchSpecific: async (params) => {
      return await ipcRenderer.invoke(SettingsIPC.GET_CONFIGS, params)
    },
    selectFolder: async () => {
      return await ipcRenderer.invoke(SettingsIPC.SELECT_FOLDER)
    },
    setNewSettings: (settings: { default_save_directory: string }) => {
      return ipcRenderer.send(SettingsIPC.SET, settings)
    },
  },
  library: {
    getLibrary: async () => {
      return await ipcRenderer.invoke(LibraryIPC.GET_ALL)
    },
    getScreenshotById: async (id: number) => {
      return await ipcRenderer.invoke(LibraryIPC.GET_BY_ID, id)
    },
    getPreviewImageId: async () => {
      return await ipcRenderer.invoke(LibraryIPC.GET_PREVIEW_IMAGE_ID)
    },
    getDetailImageId: async () => {
      return await ipcRenderer.invoke(LibraryIPC.GET_DETAIL_IMAGE_ID)
    },
    deleteScreenshot: async (id: number) => {
      return await ipcRenderer.invoke(LibraryIPC.DELETE, id)
    },
    updateScreenshotTitle: async (id: number, title: string) => {
      return await ipcRenderer.invoke(LibraryIPC.UPDATE_TITLE, { id, title })
    },
    saveScreenshotAs: async (filepathOrDataUrl: string) => {
      return await ipcRenderer.invoke(LibraryIPC.SAVE_AS, filepathOrDataUrl)
    },
    saveScreenshot: async (params: { dataUrl: string; filepath: string }) => {
      return await ipcRenderer.invoke(LibraryIPC.SAVE, params)
    },
    copyScreenshot: async (filepath: string) => {
      return await ipcRenderer.invoke(LibraryIPC.COPY, filepath)
    },
    copyScreenshotWithDrawing: async (dataUrl: string) => {
      return await ipcRenderer.invoke(LibraryIPC.COPY_DRAWING, dataUrl)
    },
    showScreenshotInFolder: async (filepath: string) => {
      return await ipcRenderer.invoke(
        'electron:library:show-in-folder',
        filepath,
      )
    },
    openImageDetail: async (id: number) => {
      return await ipcRenderer.send(LibraryIPC.OPEN_DETAIL, id)
    },
  },
  print: {
    setFullscreenPrint: async () => {
      return await ipcRenderer.invoke(PrintIPC.SET_FULLSCREEN_PRINT)
    },
    setPartialScreenPrint: async () => {
      return await ipcRenderer.invoke(PrintIPC.SET_PARTIAL_SCREEN_PRINT)
    },
    getCurrentMode: async () => {
      return await ipcRenderer.invoke(PrintIPC.GET_CURRENT_MODE)
    },

    takeFullScreenshot: async () => {
      return ipcRenderer.invoke(PrintIPC.TAKE_FULL_SCREENSHOT)
    },
    takePartialScreenshot: async (selection) => {
      return ipcRenderer.invoke(PrintIPC.TAKE_PARTIAL_SCREENSHOT, { selection })
    },
  },
  dock: {
    openSettingsScreen: async () => {
      return await ipcRenderer.invoke(DockIPC.OPEN_SETTINGS_SCREEN)
    },
    openLibraryScreen: async () => {
      return await ipcRenderer.invoke(DockIPC.OPEN_LIBRARY_SCREEN)
    },
  },
  state: {
    onReadyToTakePrint: (callback: (mode: PrintScreenMode) => void) => {
      return ipcRenderer.on(GlobalsIPC.READY_TO_TAKE_PRINT, (_, data) => {
        console.log('onReadyToTakePrint', data)
        callback(data.mode as PrintScreenMode)
      })
    },
    onModeChanged: (callback: (mode: PrintScreenMode) => void) => {
      return ipcRenderer.on(GlobalsIPC.MODE_CHANGED, (_, data) => {
        console.log('onModeChanged', data)

        callback(data.mode as PrintScreenMode)
      })
    },
  },
} as TreenshoterAPI

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.api = api
}
