// Nuxt モジュールをカテゴリ別・種類別に集計する（docs/context/05_ai-prompts.md の F）
// データ: npm の @nuxt/modules（https://github.com/nuxt/modules）の modules.json と、各モジュールの npm メタデータ
// 使い方: node scripts/count-nuxt-modules.mjs（ルートでは pnpm modules）。出力は results/modules/
//
// 一覧の掲載数をそのまま見せると古いモジュールまで数えてしまうので、次をすべて満たすものを「使える」として数える。
//   1. compatibility.nuxt の宣言範囲に Nuxt 4 が入っている
//   2. npm の最新版が deprecated でない
//   3. npm での最終更新が Nuxt 4.0.0 の公開日以降
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'results', 'modules')
const REGISTRY = 'https://registry.npmjs.org'

// ---- データ取得 ----
const getJson = async (url, headers = {}) => {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return res.json()
}

async function loadModules() {
  const meta = await getJson(`${REGISTRY}/@nuxt/modules`)
  const version = meta['dist-tags'].latest
  const modules = await getJson(`https://cdn.jsdelivr.net/npm/@nuxt/modules@${version}/modules.json`)
  return { modules, version, published: meta.time[version] }
}

// 各モジュールの npm 最終更新日と deprecated を取る（install 用の軽いメタデータ）
async function loadNpmStatus(modules) {
  const status = new Map()
  let next = 0
  const worker = async () => {
    while (next < modules.length) {
      const name = modules[next++].npm
      try {
        const d = await getJson(`${REGISTRY}/${name.replace('/', '%2f')}`, { accept: 'application/vnd.npm.install-v1+json' })
        const latest = d['dist-tags']?.latest
        status.set(name, { modified: d.modified, deprecated: Boolean(d.versions?.[latest]?.deprecated) })
      }
      catch {
        status.set(name, null) // 取得できなかったものは「使える」に数えない
      }
    }
  }
  await Promise.all(Array.from({ length: 16 }, worker))
  return status
}

// ---- 最小限の semver 範囲判定（modules.json に出てくる書き方だけ対応） ----
const parse = (v) => {
  const core = v.replace(/^v/, '').split('-')[0]
  const parts = core.split('.').filter(n => n !== 'x' && n !== '*')
  const [ma = 0, mi = 0, pa = 0] = parts.map(Number)
  return { v: [ma, mi, pa], parts: parts.length }
}
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]
function comparator(c, ver) {
  const m = c.match(/^(>=|<=|>|<|\^|~|=)?(.+)$/)
  // プレリリース（>=3.0.0-rc.11）は正式版と同じに扱う。判定対象は x.y.0 / x.y.99 の正式版だけなので影響しない
  const { v, parts } = parse(m[2])
  const d = cmp(ver, v)
  switch (m[1] ?? '=') {
    case '>=': return d >= 0
    case '>': return d > 0
    case '<=': return d <= 0
    case '<': return d < 0
    case '^': return d >= 0 && (v[0] > 0 ? ver[0] === v[0] : ver[1] === v[1])
    case '~': return d >= 0 && ver[0] === v[0] && ver[1] === v[1]
    default: return ver.slice(0, parts).every((x, i) => x === v[i]) // 部分指定（3 / 3.1）はその範囲すべて
  }
}
const satisfies = (range, ver) =>
  range.split('||').some(set => set.trim().split(/\s+/).filter(Boolean).every(c => comparator(c, ver)))
// 「メジャー N 系のどれかを宣言範囲に含むか」を N.0.0〜N.99.99 の代表点で判定する
const supportsMajor = (range, major) => {
  if (!range) return false
  for (let mi = 0; mi < 100; mi++) for (const pa of [0, 99]) if (satisfies(range, [major, mi, pa])) return true
  return false
}

// ---- 集計 ----
const countBy = (xs, f) => Object.fromEntries(Object.entries(xs.reduce((o, x) => ((o[f(x)] = (o[f(x)] ?? 0) + 1), o), {}))
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
// official と community（nuxt-modules organization）をまとめて「公式系」と呼ぶ
const group = m => (m.type === 'official' || m.type === 'community' ? '公式系' : '3rd-party')

const { modules, version, published } = await loadModules()
const nuxt4Released = (await getJson(`${REGISTRY}/nuxt`)).time['4.0.0']
const npm = await loadNpmStatus(modules)

const checks = m => {
  const s = npm.get(m.npm)
  return {
    nuxt4: supportsMajor(m.compatibility?.nuxt, 4),
    notDeprecated: Boolean(s) && !s.deprecated,
    updated: Boolean(s?.modified) && s.modified >= nuxt4Released,
  }
}
const usable = modules.filter((m) => {
  const c = checks(m)
  return c.nuxt4 && c.notDeprecated && c.updated
})

const summary = {
  collectedAt: new Date().toISOString(),
  source: { package: '@nuxt/modules', version, published },
  criteria: {
    description: 'Nuxt 4 を宣言範囲に含む・npm 最新版が deprecated でない・Nuxt 4.0.0 公開日以降に npm で更新',
    nuxt4ReleasedAt: nuxt4Released,
  },
  listed: {
    total: modules.length,
    byType: countBy(modules, m => m.type),
    excluded: {
      noNuxt4: modules.filter(m => !checks(m).nuxt4).length,
      deprecated: modules.filter(m => checks(m).nuxt4 && !checks(m).notDeprecated).length,
      notUpdatedSinceNuxt4: modules.filter(m => checks(m).nuxt4 && checks(m).notDeprecated && !checks(m).updated).length,
    },
  },
  usable: {
    total: usable.length,
    byGroup: countBy(usable, group),
    byType: countBy(usable, m => m.type),
    byCategory: countBy(usable, m => m.category),
    byCategoryAndGroup: Object.fromEntries(Object.keys(countBy(usable, m => m.category)).map(c => [c,
      countBy(usable.filter(m => m.category === c), group)])),
  },
}

// ---- SVG（使えるモジュールのカテゴリ別横棒、1 系列） ----
const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]))
function chart(s) {
  const rows = Object.entries(s.usable.byCategory)
  const W = 720, left = 120, right = 56, top = 76, rowH = 24, barH = 16
  const H = top + rows.length * rowH + 60
  const max = Math.max(...rows.map(r => r[1]))
  const x = n => (n / max) * (W - left - right)
  const g = s.usable.byGroup
  const bars = rows.map(([cat, n], i) => {
    const y = top + i * rowH + (rowH - barH) / 2, w = Math.max(x(n), 2), r = Math.min(4, w)
    // 値側だけ角丸（ベースライン側は直角）
    const d = `M${left},${y}h${w - r}a${r},${r} 0 0 1 ${r},${r}v${barH - 2 * r}a${r},${r} 0 0 1 -${r},${r}h-${w - r}z`
    return `<g><title>${esc(cat)}: ${n}件</title>
  <rect x="0" y="${top + i * rowH}" width="${W}" height="${rowH}" fill="transparent"/>
  <text class="label" x="${left - 8}" y="${y + barH / 2}" text-anchor="end" dominant-baseline="central">${esc(cat)}</text>
  <path class="bar" d="${d}"/>
  <text class="value" x="${left + w + 6}" y="${y + barH / 2}" dominant-baseline="central">${n}</text></g>`
  }).join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">Nuxt 4 で使えるモジュールのカテゴリ別件数（${s.usable.total}件）</title>
<desc id="d">${esc(rows.map(([c, n]) => `${c} ${n}`).join(', '))}</desc>
<style>
  svg { --surface:#fcfcfb; --ink:#0b0b0b; --ink2:#52514e; --muted:#898781; --bar:#2a78d6; font-family: system-ui, sans-serif; }
  @media (prefers-color-scheme: dark) { svg { --surface:#1a1a19; --ink:#ffffff; --ink2:#c3c2b7; --bar:#3987e5; } }
  .bg { fill: var(--surface); } .bar { fill: var(--bar); }
  .h1 { fill: var(--ink); font-size: 17px; font-weight: 700; } .h2 { fill: var(--ink2); font-size: 12px; }
  .label { fill: var(--ink2); font-size: 12px; } .value { fill: var(--ink); font-size: 12px; font-variant-numeric: tabular-nums; }
  .foot { fill: var(--muted); font-size: 11px; } g:hover .bar { opacity: .8; }
</style>
<rect class="bg" width="${W}" height="${H}"/>
<text class="h1" x="24" y="32">Nuxt 4 で使えるモジュールのカテゴリ別件数（${s.usable.total}件）</text>
<text class="h2" x="24" y="54">公式系（official + community）${g['公式系'] ?? 0}件・3rd-party ${g['3rd-party'] ?? 0}件</text>
${bars}
<text class="foot" x="24" y="${H - 32}">対象: Nuxt 4 対応を宣言し、deprecated でなく、Nuxt 4.0.0 公開（${s.criteria.nuxt4ReleasedAt.slice(0, 10)}）以降に npm で更新されたもの（一覧掲載 ${s.listed.total}件中）</text>
<text class="foot" x="24" y="${H - 14}">データ: @nuxt/modules ${esc(s.source.version)}（${s.source.published.slice(0, 10)} 公開）と npm レジストリ・集計日 ${s.collectedAt.slice(0, 10)}</text>
</svg>
`
}

// ---- Markdown ----
function md(s) {
  const t = (title, obj) => `| ${title} | 件数 |\n| --- | ---: |\n${Object.entries(obj).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}`
  const e = s.listed.excluded
  return `# Nuxt モジュール集計

Nuxt 4 で実際に使えるモジュールは **${s.usable.total}件** です（一覧の掲載数は ${s.listed.total}件）。

- 集計日時: ${s.collectedAt}
- データ: \`@nuxt/modules\` ${s.source.version}（${s.source.published} 公開）と、各モジュールの npm メタデータ
- 生成: \`pnpm modules\`（\`node scripts/count-nuxt-modules.mjs\`）。この表の数値はスクリプトの出力だけです

## 「使える」の条件

次をすべて満たすものを数えています。

1. \`compatibility.nuxt\` の宣言範囲に Nuxt 4 が入っている
2. npm の最新版が deprecated でない
3. npm での最終更新が Nuxt 4.0.0 の公開日（${s.criteria.nuxt4ReleasedAt.slice(0, 10)}）以降

条件 3 は「メンテナンスが続いているか」の目安です。npm の \`modified\` はメタデータの変更でも更新されるため、厳密な最終リリース日ではありません。

| 一覧の掲載数から外したもの | 件数 |
| --- | ---: |
| Nuxt 4 を宣言範囲に含まない（Nuxt 2 / 3 専用） | ${e.noNuxt4} |
| npm の最新版が deprecated | ${e.deprecated} |
| Nuxt 4.0.0 公開以降に npm で更新されていない | ${e.notUpdatedSinceNuxt4} |

## 使えるモジュールの内訳

公式系は official（Nuxt チーム）と community（nuxt-modules organization）を合わせた数です。3rd-party には企業の公式モジュールと個人作者のモジュールの両方が入っています。

${t('区分', s.usable.byGroup)}

${t('種類', s.usable.byType)}

${t('カテゴリ', s.usable.byCategory)}

![カテゴリ別件数](categories.svg)
`
}

await mkdir(OUT, { recursive: true })
await writeFile(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2) + '\n')
await writeFile(join(OUT, 'summary.md'), md(summary))
await writeFile(join(OUT, 'categories.svg'), chart(summary))
console.log(JSON.stringify({ listed: summary.listed, usable: { total: summary.usable.total, byGroup: summary.usable.byGroup, byType: summary.usable.byType } }, null, 2))
