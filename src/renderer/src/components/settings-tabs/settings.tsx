import { cn } from '../../lib/cn'
import { Folder } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../button'

export function SettingsTabs() {
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [folder, setFolder] = useState<string>('')

  async function handleOpenSelectFolder() {
    const result = await window.api.settings.selectFolder()

    if (result) {
      setFolder(result.directory)
    }
  }

  function handleSaveNewConfiguration() {
    window.api.settings.setNewSettings({
      default_save_directory: folder,
    })
  }

  useEffect(() => {
    async function fetchFolder() {
      const response = await window.api.settings.fetchSpecific({
        settingsToFetch: ['default_save_directory'],
      })

      setFolder(response.default_save_directory)
    }

    fetchFolder()
  }, [])

  return (
    <div className="h-full w-full p-4 pt-2">
      <div className="max-w-2xl">
        <div className="mb-3">
          <h2 className="text-xl font-bold text-zinc-50">Settings</h2>
          <p className="text-zinc-400 text-xs">
            Manage your application preferences
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-zinc-800 rounded-md shrink-0">
                <Folder className="size-5 text-zinc-300" />
              </div>
              <div className="flex-1 min-w-0 flex items-start flex-col">
                <label
                  htmlFor="default-folder"
                  className="text-base font-medium text-zinc-100 block"
                >
                  Default Screenshot Directory
                </label>
                <p className="text-xs text-zinc-500 leading-3">
                  Choose where your screenshots will be saved
                </p>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center border border-zinc-700 rounded-md',
                'bg-zinc-950/50 overflow-hidden',
                'transition-colors hover:border-zinc-600',
                'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
              )}
            >
              <div className="flex-1 flex items-center px-4 py-3 min-h-11">
                <input
                  ref={folderInputRef}
                  type="text"
                  id="default-folder"
                  value={folder}
                  disabled
                  className={cn(
                    'w-full text-zinc-300 text-sm bg-transparent',
                    'focus-visible:outline-none placeholder:text-zinc-600',
                    'disabled:text-zinc-400',
                  )}
                  placeholder="No folder selected"
                />
              </div>

              <button
                type="button"
                className={cn(
                  'px-4 py-2 bg-blue-600 hover:bg-blue-500',
                  'text-white text-sm font-medium',
                  'whitespace-nowrap transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2',
                  'focus-visible:ring-blue-500 focus-visible:ring-inset',
                  'active:bg-blue-700 h-11 flex items-center',
                )}
                onClick={handleOpenSelectFolder}
              >
                Browse
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-end">
            <Button onClick={handleSaveNewConfiguration}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
