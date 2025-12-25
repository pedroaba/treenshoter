import { useEffect } from 'react'
import { Routes } from './routes'

export function App() {
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        window.api.global.escape()
      }
    }

    window.addEventListener('keydown', handleEscapeKey)

    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  return <Routes />
}
