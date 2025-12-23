import { Route } from 'react-router-dom'

import { Router } from '../../../routers'
import { LibraryScreen } from './screens/library'
import { SettingsScreen } from './screens/settings'
import { OverlayScreen } from './screens/overlay'
import { Dock } from './screens/dock'
import { PreviewScreen } from './screens/preview'
import { DetailScreen } from './screens/detail'

export function Routes() {
  return (
    <Router
      library={<Route path="/" element={<LibraryScreen />} />}
      settings={<Route path="/" element={<SettingsScreen />} />}
      overlay={<Route path="/" element={<OverlayScreen />} />}
      dock={<Route path="/" element={<Dock />} />}
      preview={<Route path="/" element={<PreviewScreen />} />}
      detail={<Route path="/" element={<DetailScreen />} />}
    />
  )
}
