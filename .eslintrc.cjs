module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:n/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { 
    react: {
      version: '18.2'
    }
  },
  plugins: [
    'react-refresh',
    '@stylistic',
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    "@stylistic/arrow-spacing": ["warn", { "before": true, "after": true }],
    "@stylistic/brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
    "@stylistic/comma-dangle": ["error", "always-multiline"],
    "@stylistic/comma-spacing": "error",
    "@stylistic/comma-style": "error",
    "curly": ["error", "multi-line", "consistent"],
    "@stylistic/dot-location": ["error", "property"],
    "n/handle-callback-err": "off",
    "@stylistic/indent": ["error", 2],
    "@stylistic/keyword-spacing": "error",
    "max-nested-callbacks": ["error", { "max": 4 }],
    "@stylistic/max-statements-per-line": ["error", { "max": 2 }],
    "no-console": "off",
    "no-empty-function": "error",
    "@stylistic/no-floating-decimal": "error",
    "no-inline-comments": "error",
    "no-lonely-if": "error",
    "@stylistic/no-multi-spaces": "error",
    "@stylistic/no-multiple-empty-lines": ["error", { "max": 2, "maxEOF": 1, "maxBOF": 0 }],
    "no-shadow": ["error", { "allow": ["err", "resolve", "reject"] }],
    "@stylistic/no-trailing-spaces": ["error"],
    "no-var": "error",
    "@stylistic/object-curly-spacing": ["error", "always"],
    "prefer-const": "error",
    "@stylistic/quotes": ["error", "single"],
    "@stylistic/semi": ["error", "always"],
    "@stylistic/space-before-blocks": "error",
    "@stylistic/space-before-function-paren": ["error", {
      "anonymous": "never",
      "named": "never",
      "asyncArrow": "always"
    }],
    "n/no-missing-import": "off",
    "@stylistic/space-in-parens": "error",
    "@stylistic/space-infix-ops": "error",
    "@stylistic/space-unary-ops": "error",
    "@stylistic/spaced-comment": "error",
    "yoda": "error"
  },
}
