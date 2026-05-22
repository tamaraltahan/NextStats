import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  {
    ignores: ['node_modules/**', '.next/**', 'backend/python/**'],
  },
  ...nextCoreWebVitals,
  {
    rules: {
      // Allow standard fetch-on-mount patterns in pages router client components
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];

export default eslintConfig;
