module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'standard',
    'prettier',
    'plugin:prettier-vue/recommended',
    'plugin:vue/recommended'
  ],
  plugins: ['prettier-vue', 'vue'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'vue/this-in-template': 0
  }
}
