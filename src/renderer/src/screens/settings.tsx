import { AboutTab } from '../components/settings-tabs/about'
import { SettingsTabs } from '../components/settings-tabs/settings'
import { TabButton } from '../components/tab-button'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import IconPNG from '../assets/icon.png'
import { SetTitleUtils } from '../utils/set-title'

export function SettingsScreen() {
  const [currentTab, setCurrentTab] = useState<string>('settings')

  function handleChangeTab(tab: string) {
    if (currentTab === tab) {
      return
    }

    setCurrentTab(tab)
  }

  function renderTabContent() {
    if (currentTab === 'settings') {
      return <SettingsTabs />
    }

    if (currentTab === 'about') {
      return <AboutTab />
    }

    return null
  }

  useEffect(() => {
    SetTitleUtils.set('Settings')
  }, [])

  return (
    <div className="bg-zinc-950 w-screen h-screen grid grid-cols-[12rem_1fr] divide-x divide-zinc-700">
      <div className="min-h-screen flex flex-col">
        <div className="p-2 border-b border-zinc-700 flex items-center justify-center gap-2">
          <img src={IconPNG} alt="Treeshoter Icon" className="size-9" />
          <h1 className="text-white text-center">Treeshoter</h1>
        </div>

        <div className="p-2 h-full flex flex-col">
          <div>
            <TabButton
              isCurrentTab={currentTab === 'settings'}
              onClick={() => handleChangeTab('settings')}
            >
              Settings
            </TabButton>
          </div>
          <TabButton
            isCurrentTab={currentTab === 'about'}
            onClick={() => handleChangeTab('about')}
            className="mt-auto w-fit bg-transparent"
          >
            <Info className="size-4" />
          </TabButton>
        </div>
      </div>
      <div className="h-screen overflow-y-auto custom-scrollbar">
        {renderTabContent()}
      </div>
    </div>
  )
}
