# ロングキックを科学する — Phase 1・2

中高生のサッカー選手向け物理教育サイト。Astro 7 + TypeScript + MDX + KaTeX + SVG + Plotly.js。高校物理から出発し、途中式を追いながら大学レベルの解析と技術応用へ進みます。

## 今回の完成範囲

- トップ、8章紹介、24講座の導線、共通記事テンプレート、参考文献、サイト説明。
- Chapter 06の3講座本文：06-1「なぜボールは放物線を描くのか？」、06-2「45度で蹴ると最も遠くまで飛ぶのか？」、06-3「空気抵抗があると軌道はどう変わるのか？」。
- 未制作21講座はタイトル・学習目標・8セクションの詳細アウトライン。「本文未公開」を全導線と記事に明示。
- オリジナルSVG：速度成分と重力、角度別軌道、無抵抗/抗力比較。計算結果から生成。
- 初速度、角度、打ち出し高さを変更する無抵抗の飛距離シミュレーター。飛距離・最高点・滞空時間・軌道・数値表。
- Vitest、Playwright + axe、GitHub Actions、GitHub Pages手動公開設定。

対象リポジトリ：`shujiyoneda/long-kick-science`。GitHub Pagesへの公開は手動ワークフローで行います。通常のpushとValidateはサイトを公開しません。

## 単一HTMLプレビュー

`long-kick-preview.html`は公開前レビュー用です。ダウンロードしてブラウザーで開くと、講座間の移動とシミュレーターを試せます。CSS・数式フォント・Plotlyを内包し、初回インストールは不要です。正式なGitHub Pages配信版は`dist/`です。埋め込みプレビューの制限があるアプリでは、ファイルを保存して通常のブラウザーから開いてください。

再生成する場合は、ルートパスで`npm run build`の後に`node scripts/build-preview.mjs`を実行します。

## ローカル起動

Node.js **24**、npmを使用。ZIPを展開し、`package.json`のあるフォルダーで実行してください。

```bash
npm ci
npm run dev
```

ブラウザーで `http://localhost:4173/` を開きます。トップ→講座一覧→Chapter 06、またはシミュレーターへ進めます。ネット接続が必要なのは初回の依存パッケージ取得です。外部フォント、外部グラフCDN、API、解析トラッカーは使用していません。

ビルド済みファイルも`dist/`に同梱しています。これらはHTTPサーバー経由で閲覧してください。`file://`での直開きではモジュール・サイト内リンクが動作しません。

```bash
npm run build
npm run preview
```

## 検証

```bash
npm run validate
npx playwright install --with-deps chromium
npm run test:e2e
```

- `check`：Astro/TypeScriptの型チェック。
- `test`：解析解、境界条件、着地・エネルギー保存、最適角、RK4収束、講座状態、KaTeX構文。
- `verify:site`：全38ページの内部リンク、アンカー、静的アセット、公開/未公開の区分。
- `test:e2e`：デスクトップChromium・Pixel 7相当の画面設定。導線、入力、スライダー、リセット、不正値、表、横はみ出し、axe検査。Playwright用ブラウザーを事前にインストールする。テスト用サーバーはPlaywrightが起動・終了し、サブパスの検査と並行稼働させない。
- `ci.yml`：上記とGitHub Pagesのサブパスでの再ビルドを行う。実行結果はリポジトリのActions → Validateを参照。

実施結果と制約は `docs/VERIFICATION.md` に記載。自動アクセシビリティ検査の通過は、全ての支援技術での動作を保証しません。

## GitHub Pagesへの公開手順

1. 対象は `shujiyoneda/long-kick-science`。公開する内容を確認する。
2. リポジトリには本プロジェクトのソースを配置する。`node_modules`、`.astro`、`dist`はコミット不要。`package-lock.json`は含める。
3. リポジトリのSettings → Pages → Sourceを **GitHub Actions** にする。
4. Actionsの **Validate** を実行し、型・計算・ビルド・ブラウザー検査を確認する。
5. 内容の公開承認後、**Deploy to GitHub Pages** を手動実行する。
6. Actionsが返す公開URLで主要ページ、数式フォント、Plotly、リセット、リンク、404を確認する。

`deploy.yml`は`workflow_dispatch`のみです。pushだけでは公開しません。`actions/configure-pages`の出力から`SITE_URL`と`BASE_PATH`を受け取るため、通常のプロジェクトPages、ユーザーPages、カスタムドメインに同じ設定を利用できます。公開権限やPages自体の有効化はGitHub側で必要です。

サブパスをローカルで検証する例：

```bash
SITE_URL=https://example.github.io BASE_PATH=/long-kick-science npm run build
BASE_PATH=/long-kick-science npm run verify:site
```

`SITE_URL`を指定しない通常のローカルビルドではcanonicalタグを生成せず、架空の公開URLを埋め込みません。

## ファイル構成

|場所|役割|
|---|---|
|`src/data/curriculum.json`|8章24講座、公開状態、目標、アウトライン|
|`src/content/lessons/06-*.mdx`|Chapter 06完成本文|
|`src/pages/learn/[id].astro`|共通記事テンプレート・目次・前後の講座|
|`src/components/Equation.astro`|KaTeX、記号・単位・成立条件|
|`src/components/Diagram.astro`|計算に基づくオリジナルSVG|
|`docs/diagrams/`|完成ビルドから取り出した3つのSVGファイル|
|`src/lib/physics.ts`|解析解・教育用抗力計算・入力検証|
|`src/scripts/simulator.ts`|入力とグラフ・表・結果の同期|
|`src/data/references.ts`|確認済み参考文献|
|`tests`|Vitest/Playwright|
|`docs`|デザイン、科学QA、更新手順、検証結果|

## モデルと出典

無抵抗シミュレーターは重力加速度9.81 m/s²を使用。高さは着地時の中心を0とする相対値。式、成立条件、現実との差異はシミュレーター画面と講座に記載。操作型モデルに抗力や揚力は含みません。06-3の抗力図・表は別の一定抗力係数モデルによる教育用比較で、実球の予測器ではありません。

参照：OpenStax University Physics Vol.1 §4.3、Linthorne & Patel (2011)、NASA Glenn Drag of a Sphere、Asai & Seo (2013)。実験対象の限界を記事に併記。参考文献へのリンクはサイト内にもあります。

「最終サイト設計書 Version 1.0」の会話で取得できた講座名・方針と、今回の制作指示を使用しました。独立した原本ファイル全文との逐語照合は未実施です。21講座の個別アウトラインは今回の共通8セクション要件に沿って具体化しています。詳細は`docs/DESIGN.md`。

更新は `docs/UPDATE.md` を参照してください。
