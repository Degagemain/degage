import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],
    ignorePatterns: ['.next/', 'node_modules/', 'next-env.d.ts', 'app/storage/client'],
    rules: {
      'max-len': ['warn', { code: 144 }],
      quotes: ['error', 'single', { avoidEscape: true }],
      'eol-last': ['error', 'always'],
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
    overrides: [
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
    ],
  }),
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
              message:
                'Do not call better-auth directly from a route. Wrap the handler in withPublic/withAuth/withAdmin from @/api/with-context instead.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
