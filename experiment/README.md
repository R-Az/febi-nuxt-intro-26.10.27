# 検証：AI に同じ指示を出したら Nuxt と Next.js で何が違うか

同じ AI・同じ指示で同じアプリを作らせ、トークン数や所要時間、介入回数、コード量を比べます。設計は [docs/context/03_experiment-plan.md](../docs/context/03_experiment-plan.md)、AI に渡す指示文は [05_ai-prompts.md](../docs/context/05_ai-prompts.md) の B にあります。

| フォルダ | 中身 |
| --- | --- |
| `nuxt/` | Nuxt 側の生成物（例：`nuxt/r1-1/`） |
| `next/` | Next.js 側の生成物（例：`next/r1-1/`） |

計測結果は `results/{round}-{framework}-{n}.json` に記録します。

生成したアプリの中に `.git` ができた場合（`create-next-app` は既定で `git init` します）は、このリポジトリに含める前に削除してください。
