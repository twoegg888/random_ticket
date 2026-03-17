import fs from 'fs'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const figmaAssetResolver = () => {
  const assetsDir = path.resolve(__dirname, './src/assets')
  const fallbackAsset = path.resolve(
    __dirname,
    './src/assets/7448817f6bb8739bc4187d6209b1a0c3fb4bcad6.png',
  )

  return {
    name: 'figma-asset-resolver',
    resolveId(source: string) {
      if (!source.startsWith('figma:asset/')) return null

      const assetName = source.replace('figma:asset/', '')
      const candidate = path.resolve(assetsDir, assetName)
      return fs.existsSync(candidate) ? candidate : fallbackAsset
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '/utils': path.resolve(__dirname, './utils'),
      'lucide-react': path.resolve(__dirname, './src/shims/lucide-react.tsx'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
