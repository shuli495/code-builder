module.exports = {
    env: {
        node: true,
        es2020: true,
    },
    extends: ['airbnb-base', 'plugin:prettier/recommended'],
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
    },
    rules: {
        'class-methods-use-this': 'off',
    },
};
