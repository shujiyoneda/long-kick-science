# 更新手順

## 記事を修正する

1. `src/content/lessons/06-1.mdx`等を編集する。8個のh2とid（phenomenon/hypothesis/physics/derivation/calculation/advanced/application/check）を維持する。
2. 数式は`Equation`を使う。`tex={String.raw\`…\`}`、`symbols`（記号・単位）、`conditions`（成立条件）を指定する。重力だけの標準条件以外ではデフォルトに頼らず上書きする。
3. 主張を`Evidence kind="model"`、`evidence`、`hypothesis`で区別する。
4. 新しい学術的主張は一次資料で確認し、本文と`src/data/references.ts`を更新する。未確認の書誌を作らない。
5. 計算条件を変えたときは`Calculation`・`Diagram`、Chapter 07では`SpinCalculation`・`SpinDiagram`も確認する。異なる条件の結果を同じ図に混在させない。
6. `npm run validate`、`npm run test:e2e`、モバイル目視で検証する。

## 未公開講座を本文公開へ進める

1. `curriculum.json`の該当講座の目標とアウトラインを確認。
2. 同じIDのMDX（例`01-1.mdx`）を`src/content/lessons/`に作る。06-1をコピーして8セクションを保つ。
3. MDX内でパス関数を使う場合は`import {url as href}`とする。`url`はMDXの自動メタデータ名と衝突するため、同名でimportしない。
4. 必要な図、計算、理解度チェック、解答、出典を作り、内容と出典を照合。
5. 完成後にのみ`status`を`published`へ変更し、読む時間を見直す。
6. `tests/content.test.ts`の期待する公開IDを更新。内部リンク検査・トップ/フッター/一覧の公開件数はカリキュラムから算出する。説明ページの制作範囲と参考文献も更新する。未完成のまま公開状態だけ変えない。

## 物理モデルを変更する

`src/lib/physics.ts`が共通の計算元。単位・許容範囲・境界条件を先に定義し、既知解と保存量など実装とは独立した関係で検証する。Chapter 07のモデルは`src/lib/spin.ts`。新モデルは既存の無抵抗モデルと分け、図・画面・記事・テストの条件をそろえる。誤差と実験への適合性は別々に検証。

## 公開する

作業ブランチで変更し、Validateの結果と差分を確認。対象リポジトリ・変更内容の承認を得たうえで反映し、手動のDeploy to GitHub Pagesを実行する。公開URLで画面を再確認。通常のpushではValidateのみを実行する。公開更新は手動のワークフローで行う。

## 実機で確認する項目

- iOS Safari / Android Chromeでトップ・各講座・シミュレーターを開く。
- 縦横回転、数式の横スクロール、軌道ラベル、数値入力、スライダー、リセット。
- キーボード表示時の入力、拡大表示、フォーカス、スクリーンリーダー。
- ブラウザーの戻る/進む、サブパスの深いURLへの直接アクセス、リンクと404。
- キャッシュを残した更新後、CSS/JS/数式フォントの読み込み。

PWAやオフライン対応は今回の範囲に含まない。
