# TASKS

このファイルは現在フェーズ以降の実行タスクを管理します。完了済みフェーズの詳細履歴は `docs/PROGRESS.md` とGit履歴を参照してください。

## P8 カゲマサ戦・みかん星の核奪還・MVPエンディング

### 状態機械・導線
- [x] ExploreScreenへ条件分岐を積み増さず、P8進行を `P8FlowController` へ分離
- [x] `p8_kagemasa_route_unlocked` から「天守奥へ進む」導線へ接続
- [x] Explore/StarMapのどちらからでもP8開始可能にする
- [x] ボス開始時にHP/MPを全回復
- [x] 星封じカードをP8開始時に解放

### カゲマサ戦
- [x] `enc_boss_kagemasa` / `B-E01` / `isBoss: true` で開始
- [x] カゲマサ戦UIで星封じゲージを表示
- [x] 通常ダメージだけでHP0/勝利にならないP7.1不変条件を維持
- [x] `sealGauge <= 0` でのみ正式勝利
- [x] 星封じカードでsealGaugeを大きく削れる

### 勝利後・エンディング
- [x] カゲマサ再封印 `kagemasa_sealed`
- [x] みかん星の核奪還 `mikan_core_recovered`
- [x] `acquiredItems.mikan_star_core >= 1`
- [x] ペンダントの光回復 `pendant_light_restored`
- [x] 城の星取得 `castle_star_obtained`
- [x] `collectedStars` へ `castle` を追加
- [x] 道後・松山城の回復flagを保存
- [x] `p8_completed` / `gameCompleted` を保存
- [x] `EndingScreen` を追加
- [x] Endingで未解放の空白星を残し次の冒険を示す
- [x] Endingから星地図／タイトルへ戻れる
- [x] タイトルへ戻った後の「つづきから」でEndingへ復帰できる

### Browser / CI
- [x] `p8-browser-verifier.html` を追加
- [x] P8状態遷移の純粋関数回帰を追加
- [x] 実ブラウザでP7完了→天守奥→カゲマサ戦→星封じ表示を検証
- [x] 実ブラウザでEndingScreenと空白星文言を検証
- [x] `npm run p8:browser` を追加
- [x] GitHub Actions Release GateへP8ブラウザ回帰を追加
- [x] PR #5 run #33で `npm ci` / typecheck / lint / maps / editor / build / P7 browser / P8 browser 全PASS
- [ ] mainへsquash merge
- [ ] main pushのRelease Gate / Pages deployを確認

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
