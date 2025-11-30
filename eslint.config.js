import { defineConfig, globalIgnores } from 'eslint/config'
import eslintJs from "@eslint/js";
import eslintTs from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next'
// import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  eslintJs.configs.recommended,
  eslintTs.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': [
        2, {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        }
      ]
    },
  },
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
      },
    },
  },
  // ...nextVitals,
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);
