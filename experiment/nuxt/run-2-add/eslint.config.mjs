// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      // 既存のテンプレートは、短いタグの属性を1行に並べて書いている。その書き方を許す
      'vue/max-attributes-per-line': 'off',
    },
  },
)
