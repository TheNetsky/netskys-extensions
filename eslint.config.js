// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import modulesNewline from 'eslint-plugin-modules-newline'

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        ignores: ['dist', 'node_modules'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            'modules-newline': modulesNewline
        },
        rules: {
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single'],
            'semi': ['error', 'never'],
            'comma-dangle': ['error', 'never'],
            'prefer-arrow-callback': 'error',
            'modules-newline/import-declaration-newline': 'error',
            'modules-newline/export-declaration-newline': 'error'
        }
    }
]