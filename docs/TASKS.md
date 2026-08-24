# TASKS

このファイルは現在フェーズ以降の実行タスクを管理します。完了済みフェーズの詳細履歴は `docs/PROGRESS.md` とGit履歴を参照してください。

## P8 カゲマサ戦・みかん星の核奪還・MVPエンディング

- [x] P8進行を `P8FlowController` へ分離
- [x] `p8_kagemasa_route_unlocked` から「天守奥へ進む」導線へ接続
- [x] ボス開始時にHP/MPを全回復し、`card_star_seal` を解放
- [x] `enc_boss_kagemasa` / `B-E01` / `isBoss: true` で開始
- [x] 通常ダメージだけではカゲマサを倒せず、`sealGauge <= 0` のみ正式勝利
- [x] みかん星の核・城の星・ペンダント光を回復
- [x] `collectedStars` へ `castle` を追加
- [x] `p8_completed` / `gameCompleted` を保存
- [x] `EndingScreen` と未解放の空白星を実装
- [x] Ending→タイトル→「つづきから」でEndingへ復帰
- [x] `p8:browser` をGitHub Actions Release Gateへ追加
- [x] PR #5 run #33 / docs-only run #36で全Gate PASS
- [x] PR #5をsquash merge
- [x] P8 main SHA `22b9cc2d30dcfbc2b41e5936b68f67717a195912`

## P9 旅の手帳・BGM/SE・セーブ調整

- [ ] 旅の手帳10項目
- [ ] 解放済みカード一覧
- [ ] 地域メモ
- [ ] あらすじ
- [ ] オートセーブ調整
- [ ] BGM/SEの最小整理
- [ ] P8/P9追加後の初期ロード時間を実測し、必要なら段階ロードへ変更

## P10 通しプレイ・体験版調整・公開確認

- [ ] 新規localStorageからMVP通しプレイ
- [ ] タイトル→プロローグ→道後全必須戦闘→湯の星→星地図→松山城→城山のまもり→カゲマサ→エンディングを確認
- [ ] マウス/タッチ中心・キーボード中心の両操作経路を確認
- [ ] 旧セーブ移行を確認
- [ ] 道後walkable/collisionの細部を最終目視確認
- [ ] 難易度・短文・低年齢向け導線を調整
- [ ] GitHub Pages公開URLでproduction E2E
- [ ] コンソールエラー/404/必須アセット欠落なしを確認
