import { defineConfig } from 'vite-plus'

export default defineConfig({
  lint: {
    ignorePatterns: [
      '**/node_modules/**',
      '**/src/wiki/**',
      '**/src/styles/detail/**',
      '**/src/blog/**',
      'scripts/**',
      '**/build/**',
      '**/dist/**',
    ],
  },
  fmt: {
    ignorePatterns: [
      '**/src/wiki/**',
      '**/src/styles/detail/**',
      '**/src/blog/**',
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
    ],
    semi: false,
    singleQuote: true,
  },
  staged: {
    '*': 'vp check --fix',
  },
})
