# TASKS

このファイルは現在フェーズ以降の実行タスクを管理します。完了済みフェーズの詳細履歴は `docs/PROGRESS.md` とGit履歴を参照してください。

## P9 旅の手帳・BGM/SE・セーブ調整

- [x] 旅の手帳10項目
- [x] 進行に応じたページ解放
- [x] 解放済みカード一覧
- [x] 地域メモ
- [x] 最新あらすじ
- [x] 取得済み星と最終保存時刻表示
- [x] Nキー/DOMボタンから手帳を開閉
- [x] 手帳表示で再開地点を `notebook` へ上書きしない
- [x] Web Audio APIによる画面/地域別BGMの最小実装
- [x] UI SEの最小実装
- [x] ミュート操作
- [x] explore/starMap/endingの安全画面オートセーブ同期
- [x] battle/prologue/notebook/titleをcheckpoint書換え対象外にする
- [x] GameApp起動時間をP9 verifierで計測・ログ出力
- [x] `p9:browser` をGitHub Actions Release Gateへ追加
- [x] PR #7 run #44でP7/P8/P9 browserを含む全Gate PASS

## P10 通しプレイ・体験版調整・公開確認

- [x] 新規localStorageからMVP通しプレイ（最終CI #84）
- [x] タイトル→プロローグ→道後全必須戦闘→湯の星→星地図→松山城→城山のまもり→カゲマサ→エンディングを確認
- [x] 旅の手帳を序盤/道後完了/P7完了/P8完了の各時点で確認
- [x] キーボード中心の通常操作とDOMボタン操作、390px相当タッチパッド表示を確認
- [x] 旧セーブ移行を確認
- [x] 道後walkable/collisionの細部をCI検証し、中央接続路を最小調整
- [x] BGM/SEのミュート・画面切替・runtime errorを確認
- [x] 1対2ターゲット確定と必須連戦の難易度を調整
- [x] GitHub Pages公開URLでproduction E2E（title→道後、Notebook pointer、ミュート／閉じる、reload→Continue）
- [ ] 公開環境の初期ロード時間を数値計測し、必要なら段階ロードへ変更（Release blockerではない）
- [x] コンソールエラー/404/必須アセット欠落なしを確認（ページ側。拡張機能由来ログは除外）

P10最終判定: **Release PASS**。本番URLのEndingまでの手動キー保持のみCloud Browserの入力制約で未実施だが、Endingまでの通常操作は最終P10実Chrome CIで確認済み.
