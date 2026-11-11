
import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      react,
    },
    rules: {
      'react/jsx-uses-vars': 'error',
    },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: [
      'src/components/ui/button.jsx',
      'src/components/ui/sidebar.jsx',
      'src/components/watermelon/tallie-dashboard/components/tallie/navigation.jsx',
      'src/components/watermelon/tallie-dashboard/components/tallie/theme-provider.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
