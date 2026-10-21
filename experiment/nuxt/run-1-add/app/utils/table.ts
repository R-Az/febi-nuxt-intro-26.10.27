import type { TableColumn } from '@nuxt/ui'

/** 数値の列（右寄せ・桁をそろえる）。列定義の meta に渡す */
export const NUMERIC_COLUMN_META = { class: { th: 'text-right', td: 'text-right tabular-nums' } }

/**
 * 行ごとのボタンを置く列。見出しは画面に出さず、読み上げ用に「操作」とだけ入れる。
 * （見出しを空文字にすると、サーバーと画面で描画結果が食い違い hydration の警告が出る）
 */
export function actionsColumn<T>(): TableColumn<T> {
  return {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, '操作'),
    meta: { class: { td: 'w-px text-right' } },
  }
}
