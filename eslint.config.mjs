import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierFlat from 'eslint-config-prettier/flat';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierFlat,
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'app/storage/client/**'],
  },
  {
    rules: {
      'max-len': ['warn', { code: 144 }],
      quotes: ['error', 'single', { avoidEscape: true }],
      'eol-last': ['error', 'always'],
      // Next 16 pulls in eslint-plugin-react-hooks v7 with React Compiler checks.
      // Keep prior lint strictness by disabling these newly introduced rules.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/purity': 'off',
      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        },
      ],
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['app/app/components/ui/**/*'],
    rules: {
      'max-len': 'off',
    },
  },
  // Force every API route to make an explicit auth decision via the wrappers in
  // `@/api/with-context`. Direct use of better-auth from a route is a strong
  // signal that the author is bypassing or duplicating the shared auth pipeline.
  {
    files: ['app/api/**/route.ts'],
    ignores: ['app/api/auth/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/auth',
              message: [
                'Do not call better-auth directly from a route.',
                'Wrap the handler in withPublic/withAuth/withAdmin from @/api/with-context instead.',
              ].join(' '),
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
