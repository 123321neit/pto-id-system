import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const restrictedInfrastructureImports = [
  '@aws-sdk/*',
  '@azure/*',
  '@google-cloud/*',
  '@prisma/client',
  'aws-sdk',
  'bullmq',
  'ioredis',
  'minio',
  'yandex-cloud',
];

const appBoundaryPatterns = ['apps/*', '../apps/*', '../../apps/*'];

const baseRestrictedImports = [
  {
    group: appBoundaryPatterns,
    message:
      'Apps and packages must use workspace package boundaries instead of importing app internals.',
  },
  {
    group: restrictedInfrastructureImports,
    message:
      'Provider, database, and queue SDK imports are blocked until a scoped infrastructure task authorizes an adapter.',
  },
];

const typedTypeScriptConfigs = [
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
].map((config) => ({
  ...config,
  files: ['**/*.{ts,tsx}'],
}));

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/node_modules/**',
      'pnpm-lock.yaml',
    ],
  },
  js.configs.recommended,
  ...typedTypeScriptConfigs,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-extraneous-class': ['error', { allowWithDecorator: true }],
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: baseRestrictedImports,
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^\\/(var|srv|opt|home|Users|private)\\//]',
          message:
            'Do not hardcode absolute server or workstation paths. Use environment/config-driven paths.',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['*.config.{js,mjs,ts}', 'eslint.config.mjs', 'apps/api/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['packages/shared-types/**/*.{ts,tsx}', 'packages/shared-config/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...baseRestrictedImports,
            {
              group: ['@nestjs/*', 'react', 'react-dom', 'react-router-dom', 'vite', '@vitejs/*'],
              message:
                'Shared packages must stay framework-free unless a later task narrows the boundary.',
            },
          ],
        },
      ],
    },
  },
);
