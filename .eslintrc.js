module.exports = {
  'env': {
    'browser': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended'
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 2019,
    'sourceType': 'module'
  },
  'plugins': [
    '@typescript-eslint'
  ],
  'rules': {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'curly': [
      'error',
      'multi-or-nest'
    ],
    'eqeqeq': 'error',
    'indent': [
      'error',
      2,
      { 'SwitchCase': 2 }
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    'object-curly-spacing': [
      'error',
      'always'
    ],
    'operator-linebreak': [
      'error',
      'before'
    ],
    'no-useless-return': 'error',
    'prefer-destructuring': ['error', {
      'object': true,
      'array': true
    }],
    'quotes': [
      'error',
      'single'
    ],
    'semi': [
      'error',
      'always'
    ]
  },
  'overrides': [{
    'files': ['.eslintrc.js'],
    'rules': {
      'no-undef': 'off',
    }
  }]
};