import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'electron-vite'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: (id) => {
          // Externalizar todas as dependências do node_modules (padrão do electron-vite)
          // O electron-builder vai incluí-las no asar
          // Não externalizar módulos locais
          return !id.startsWith('.') && !id.startsWith('/')
        },
      },
    },
  },
  preload: {},
  renderer: {
    plugins: [react(), tailwindcss()],
  },
})
