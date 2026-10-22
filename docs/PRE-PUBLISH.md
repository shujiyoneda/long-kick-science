# 公開直前の手順

対象：`shujiyoneda/long-kick-science`

## 通常の変更で実行されるもの

mainへのpushまたはPull RequestでValidateのみを実行する。型チェック、97件のVitest、静的ビルド、リンク検査、Playwright（デスクトップ・モバイル）、GitHub Pages相当のbaseパスを検証する。Playwrightは自分でサーバーを起動・終了する。

## 公開するまで実行しないもの

`Deploy to GitHub Pages`は手動起動のみ。push、Validate、Pull Requestによる公開は行わない。

## 公開するときの最終操作

1. GitHubのActions → Validateで、公開対象コミットの成功を確認。
2. Settings → Pages → Build and deployment → SourceでGitHub Actionsを選択する（未設定の場合）。リポジトリは非公開で作成されているため、Pagesの利用可否と公開先の公開範囲はGitHubの画面で確認する。リポジトリの可視性は本作業で変更しない。
3. 公開内容を確認後、Actions → Deploy to GitHub Pages → Run workflowを手動実行。
4. 実行結果が返すURLでトップ、3講座、シミュレーター、数式フォント、内部リンクを確認。
5. iOS Safari・Android Chromeの実機検証を実施し、結果を記録する。

この最終操作のうち公開ワークフローの起動は、公開承認前に行わない。
