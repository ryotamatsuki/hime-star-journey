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

- [ ] 新規localStorageからMVP通しプレイ
- [ ] タイトル→プロローグ→道後全必須戦闘→湯の星→星地図→松山城→城山のまもり→カゲマサ→エンディングを確認
- [ ] 旅の手帳を序盤/道後完了/P7完了/P8完了の各時点で確認
- [ ] マウス/タッチ中心・キーボード中心の両操作経路を確認
- [ ] 旧セーブ移行を確認
- [ ] 道後walkable/collisionの細部を最終目視確認
- [ ] BGM/SEの音量・切替タイミングを実機確認
- [ ] 難易度・短文・低年齢向け導線を調整
- [ ] GitHub Pages公開URLでproduction E2E
- [ ] 公開環境で初期ロード時間を実測し、必要なら段階ロードへ変更
- [ ] コンソールエラー/404/必須アセット欠落なしを確認
