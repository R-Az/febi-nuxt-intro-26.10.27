// 検証の記録（results/experiment/*.json）を集計し、summary.md とグラフ（SVG）を作る（docs/context/05_ai-prompts.md の C）
// 使い方: node scripts/summarize-experiment.mjs（ルートでは pnpm experiment）
//   数値は JSON からだけ取る。結論や気づいたことは results/experiment/findings.md に人が書き、summary.md の先頭に差し込む
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'results', 'experiment')
const CHARTS = join(DIR, 'charts')
const FW = { nuxt: 'Nuxt', next: 'Next.js' }

// ---- 記録を読む ----
const runs = {}
for (const fw of ['nuxt', 'next']) {
  for (const n of [1, 2]) {
    for (const add of [false, true]) {
      const key = `${fw}-${n}${add ? '-add' : ''}`
      const file = join(DIR, `${key}.json`)
      if (existsSync(file)) runs[key] = JSON.parse(await readFile(file, 'utf8'))
    }
  }
}
const pick = (fw, add) => [1, 2].map(n => runs[`${fw}-${n}${add ? '-add' : ''}`]).filter(Boolean)

// ---- 指標 ----
const ok = r => Object.values(r.acceptance).filter(v => v === 'o').length
const total = r => Object.keys(r.acceptance).length
const METRICS = {
  build: [
    ['出力トークン', r => r.tokens.output],
    ['入力 + キャッシュのトークン', r => r.tokens.input + r.tokens.cache_read + r.tokens.cache_creation],
    ['推定コスト（USD）', r => r.cost_usd, 2],
    ['所要時間（分）', r => r.wall_time_min, 1],
    ['ターン数', r => r.turns],
    ['介入回数', r => r.human_interventions],
    ['ビルド・型エラーの回数', r => (r.build_errors ?? 0) + (r.type_errors ?? 0)],
    ['コード行数', r => r.loc.total],
    ['うち import 行数', r => r.loc.import_lines],
    ['追加した依存の数', r => r.added_dependencies.length],
    ['受け入れ条件の ○ の数', r => ok(r), 0, r => total(r)],
  ],
  add: [
    ['出力トークン', r => r.tokens.output],
    ['推定コスト（USD）', r => r.cost_usd, 2],
    ['所要時間（分）', r => r.wall_time_min, 1],
    ['介入回数', r => r.human_interventions],
    ['変更したファイル数', r => r.diff.files_changed],
    ['追加行数', r => r.diff.lines_added],
    ['削除行数', r => r.diff.lines_removed],
    ['うち設定・つなぎ込みの追加行数', r => r.diff.config_lines_added],
    ['テーマ設定の行数（A2）', r => r.diff.theme_lines],
    ['部品ごとの上書きの数（A2）', r => r.diff.per_component_style_overrides],
    ['受け入れ条件の ○ の数', r => ok(r), 0, r => total(r)],
  ],
}

const fmt = (v, d = 0) => v == null ? '-' : Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
const avg = xs => xs.reduce((a, b) => a + b, 0) / xs.length
function cell(rs, f, d, of) {
  if (!rs.length) return '-'
  const vs = rs.map(f)
  const suffix = of ? `/${of(rs[0])}` : ''
  const a = avg(vs)
  // 整数の指標でも、平均が割り切れないときは小数1桁で出す（1.5 を 2 と丸めない）
  const ad = !d && !Number.isInteger(a) ? 1 : d
  return `${fmt(a, ad)}${suffix}（${vs.map(v => fmt(v, d)).join(' / ')}）`
}
function table(stage) {
  const add = stage === 'add'
  const head = '| 指標 | Nuxt | Next.js |\n| --- | --- | --- |'
  const rows = METRICS[stage].map(([label, f, d, of]) => `| ${label} | ${cell(pick('nuxt', add), f, d, of)} | ${cell(pick('next', add), f, d, of)} |`)
  return [head, ...rows].join('\n')
}

function acceptanceTable(add) {
  const keys = add ? ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'] : Array.from({ length: 12 }, (_, i) => String(i + 1))
  const cols = ['nuxt', 'next'].flatMap(fw => [1, 2].map(n => `${fw}-${n}${add ? '-add' : ''}`))
  const mark = { o: '○', partial: '△', x: '✗' }
  const head = `| 条件 | ${cols.join(' | ')} |\n| --- |${cols.map(() => ' :-: |').join('')}`
  const rows = keys.map(k => `| ${k} | ${cols.map(c => mark[runs[c]?.acceptance?.[k]] ?? '-').join(' | ')} |`)
  return [head, ...rows].join('\n')
}

function deps(add) {
  return ['nuxt', 'next'].flatMap(fw => [1, 2].map((n) => {
    const r = runs[`${fw}-${n}${add ? '-add' : ''}`]
    return r ? `| ${FW[fw]} ${n}回目 | ${r.added_dependencies.map(d => `\`${String(d).split(' ')[0]}\``).join('、')} |` : null
  })).filter(Boolean).join('\n')
}

// ---- グラフ（1指標につき1枚。回ごとの横棒、色はフレームワーク） ----
// 色は dataviz の検証済みパレット（categorical の1番目・2番目）。並び順は固定
const COLORS = { nuxt: ['#2a78d6', '#3987e5'], next: ['#eb6834', '#d95926'] }
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))
function chart({ title, unit, stage, f, digits = 0 }) {
  const add = stage === 'add'
  const rows = ['nuxt', 'next'].flatMap(fw => pick(fw, add).map((r, i) => ({ fw, label: `${FW[fw]} ${i + 1}回目`, v: f(r) })))
  const W = 640, left = 110, right = 90, top = 64, rowH = 30, barH = 18
  const H = top + rows.length * rowH + 58
  const max = Math.max(...rows.map(r => r.v)) || 1
  const bars = rows.map((r, i) => {
    const y = top + i * rowH + (rowH - barH) / 2
    const w = Math.max((r.v / max) * (W - left - right), 2), rad = Math.min(4, w)
    const d = `M${left},${y}h${w - rad}a${rad},${rad} 0 0 1 ${rad},${rad}v${barH - 2 * rad}a${rad},${rad} 0 0 1 -${rad},${rad}h-${w - rad}z`
    return `<g><title>${esc(r.label)}: ${fmt(r.v, digits)}${unit}</title>
  <text class="label" x="${left - 8}" y="${y + barH / 2}" text-anchor="end" dominant-baseline="central">${esc(r.label)}</text>
  <path class="bar-${r.fw}" d="${d}"/>
  <text class="value" x="${left + w + 6}" y="${y + barH / 2}" dominant-baseline="central">${fmt(r.v, digits)}${unit}</text></g>`
  }).join('\n')
  const stageLabel = add ? '2段目（機能を足す）' : '1段目（アプリを作る）'
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(`${title}（${stageLabel}）`)}">
<style>
  svg { --surface:#fcfcfb; --ink:#0b0b0b; --ink2:#52514e; --muted:#898781; --nuxt:${COLORS.nuxt[0]}; --next:${COLORS.next[0]}; font-family: system-ui, sans-serif; }
  @media (prefers-color-scheme: dark) { svg { --surface:#1a1a19; --ink:#ffffff; --ink2:#c3c2b7; --nuxt:${COLORS.nuxt[1]}; --next:${COLORS.next[1]}; } }
  .bg { fill: var(--surface); } .bar-nuxt { fill: var(--nuxt); } .bar-next { fill: var(--next); }
  .h1 { fill: var(--ink); font-size: 16px; font-weight: 700; } .h2 { fill: var(--ink2); font-size: 12px; }
  .label { fill: var(--ink2); font-size: 12px; } .value { fill: var(--ink); font-size: 12px; font-variant-numeric: tabular-nums; }
  .foot { fill: var(--muted); font-size: 11px; } g:hover path { opacity: .8; }
</style>
<rect class="bg" width="${W}" height="${H}"/>
<text class="h1" x="20" y="28">${esc(title)}</text>
<text class="h2" x="20" y="48">${esc(stageLabel)}・各フレームワーク2回</text>
${bars}
<text class="foot" x="20" y="${H - 16}">同じ指示文・同じモデル（claude-opus-5-5）で実行。各2回なので傾向として読む</text>
</svg>
`
}
const CHART_DEFS = [
  { file: 'build-output-tokens.svg', title: '出力トークン', unit: '', stage: 'build', f: r => r.tokens.output },
  { file: 'build-cost.svg', title: '推定コスト（USD）', unit: '', stage: 'build', f: r => r.cost_usd, digits: 2 },
  { file: 'build-time.svg', title: '所要時間（分）', unit: '', stage: 'build', f: r => r.wall_time_min, digits: 1 },
  { file: 'build-import-lines.svg', title: 'import の行数', unit: '', stage: 'build', f: r => r.loc.import_lines },
  { file: 'build-loc.svg', title: 'コード行数（ロックファイルを除く）', unit: '', stage: 'build', f: r => r.loc.total },
  { file: 'add-output-tokens.svg', title: '出力トークン', unit: '', stage: 'add', f: r => r.tokens.output },
  { file: 'add-theme-lines.svg', title: 'テーマ設定の行数（A2）', unit: '', stage: 'add', f: r => r.diff.theme_lines },
  { file: 'add-config-lines.svg', title: '設定・つなぎ込みの追加行数', unit: '', stage: 'add', f: r => r.diff.config_lines_added },
]

// ---- 書き出し ----
await mkdir(CHARTS, { recursive: true })
for (const c of CHART_DEFS) await writeFile(join(CHARTS, c.file), chart(c))

const findingsFile = join(DIR, 'findings.md')
const findings = existsSync(findingsFile) ? (await readFile(findingsFile, 'utf8')).trim() : '# 検証結果\n\n（findings.md に結論を書く）'
const chartLinks = stage => CHART_DEFS.filter(c => c.stage === stage).map(c => `![${c.title}](charts/${c.file})`).join('\n')

const md = `${findings}

---

以下は \`pnpm experiment\`（\`node scripts/summarize-experiment.mjs\`）が記録のJSONから生成した表です。値は2回の平均で、括弧内は1回目 / 2回目です。固定条件と記録の基準は [conditions.md](conditions.md) にあります。

## 1段目：アプリを作る

${table('build')}

${chartLinks('build')}

### 受け入れ条件

${acceptanceTable(false)}

### 追加した依存

| 回 | 依存 |
| --- | --- |
${deps(false)}

## 2段目：UI部品・カスタマイズ・Lint・計測を足す

${table('add')}

${chartLinks('add')}

### 受け入れ条件

1段目の条件1〜12も、2段目の8回すべてで再判定して ○ でした。

${acceptanceTable(true)}

### 追加した依存

| 回 | 依存 |
| --- | --- |
${deps(true)}
`
await writeFile(join(DIR, 'summary.md'), md)
console.log(`summary.md と charts/ に ${CHART_DEFS.length} 枚のグラフを書き出しました（記録 ${Object.keys(runs).length} 件）`)
