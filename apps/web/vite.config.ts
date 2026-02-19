import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),
      '@convex': path.resolve(__dirname, '../backend/convex/_generated'),
      'convex': path.resolve(__dirname, 'node_modules/convex'),
    },
  },
})
