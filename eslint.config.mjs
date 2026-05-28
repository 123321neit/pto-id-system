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

const restrictedProviderImportsExceptPrisma = restrictedInfrastructureImports.filter(
  (importPattern) => importPattern !== '@prisma/client',
);

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

const backendBoundedModules = ['workspace', 'documents', 'evidence', 'registry', 'packages', 'ai'];

const backendRelativeImportPatternsFor = (moduleName) => [
  `../${moduleName}/*`,
  `../${moduleName}/**`,
  `../../${moduleName}/*`,
  `../../${moduleName}/**`,
  `../../../${moduleName}/*`,
  `../../../${moduleName}/**`,
  `../../../../${moduleName}/*`,
  `../../../../${moduleName}/**`,
  `@api/${moduleName}/*`,
  `@api/${moduleName}/**`,
];

const backendImportPatternsFor = (moduleNames) =>
  moduleNames.flatMap((moduleName) => backendRelativeImportPatternsFor(moduleName));

const backendBoundedModuleBoundaryConfigs = backendBoundedModules.map((moduleName) => ({
  files: [`apps/api/src/${moduleName}/**/*.ts`],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          ...baseRestrictedImports,
          {
            group: backendImportPatternsFor(
              backendBoundedModules.filter((otherModuleName) => otherModuleName !== moduleName),
            ),
            message:
              'Backend bounded contexts must not import sibling module internals. Use explicit contracts or an approved orchestration boundary.',
          },
          {
            group: backendImportPatternsFor(['infrastructure']),
            message:
              'Domain modules must not directly access infrastructure. Compose provider adapters at approved module boundaries.',
          },
        ],
      },
    ],
  },
}));

const backendInfrastructureBoundaryConfig = {
  files: ['apps/api/src/infrastructure/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: appBoundaryPatterns,
            message:
              'Apps and packages must use workspace package boundaries instead of importing app internals.',
          },
          {
            group: restrictedProviderImportsExceptPrisma,
            message:
              'Provider and queue SDK imports are blocked until a scoped infrastructure task authorizes an adapter.',
          },
          {
            group: backendImportPatternsFor(backendBoundedModules),
            message:
              'Infrastructure adapters must stay provider-facing and must not import domain module internals.',
          },
        ],
      },
    ],
  },
};

const backendSharedKernelBoundaryConfig = {
  files: ['apps/api/src/shared-kernel/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          ...baseRestrictedImports,
          {
            group: [
              '@nestjs/*',
              ...backendImportPatternsFor([...backendBoundedModules, 'infrastructure', 'health']),
            ],
            message:
              'Shared kernel must stay framework-free and must not import backend module internals.',
          },
        ],
      },
    ],
  },
};

const backendHealthBoundaryConfig = {
  files: ['apps/api/src/health/**/*.ts'],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          ...baseRestrictedImports,
          {
            group: backendImportPatternsFor([...backendBoundedModules, 'infrastructure']),
            message:
              'Health checks must stay technical and must not import product module internals or infrastructure adapters.',
          },
        ],
      },
    ],
  },
};

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
  ...backendBoundedModuleBoundaryConfigs,
  backendInfrastructureBoundaryConfig,
  backendSharedKernelBoundaryConfig,
  backendHealthBoundaryConfig,
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
