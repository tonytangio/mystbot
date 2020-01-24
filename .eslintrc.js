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
        'curly': [
            'error',
            'multi-or-nest'
        ],
        'eqeqeq': 'error',
        'indent': [
            'error',
            'tab'
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
        'files': ['**/*.ts'],
        'rules': {
            'no-unused-vars': ["off"]
        }
    }]
};