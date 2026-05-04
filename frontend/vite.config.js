import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router-dom')) {
              return 'react'
            }

            if (id.includes('recharts')) {
              return 'charts'
            }

            if (id.includes('@hello-pangea/dnd')) {
              return 'dnd'
            }

            if (id.includes('framer-motion')) {
              return 'motion'
            }

            if (
              id.includes('axios') ||
              id.includes('clsx') ||
              id.includes('date-fns') ||
              id.includes('react-hot-toast') ||
              id.includes('react-icons')
            ) {
              return 'shared'
            }
          }

          return undefined
        },
      },
    },
  },
})
