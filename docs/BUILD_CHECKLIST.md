# BUILD_CHECKLIST

このチェックリストはP8時点のmain投入・GitHub Pages公開を判定するRelease Gateです。

## PR必須Gate

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run maps:validate`
- [ ] `npm run editor:smoke`
- [ ] `npm run build`
- [ ] P7/P8 verifier URLがVite dev serverでHTTP 200
- [ ] Linux Chromeで `npm run p7:browser`
- [ ] Linux Chromeで `npm run p8:browser`
- [ ] PRではPages configure/upload/deployを実行しない

## P7/P7.2回帰契約

- [x] 湯の星取得済み状態から松山城 `castle/C0` へ移動できる
- [x] 松山城の目的表示がヒント→必須3戦→くらやみ井戸→城山のまもりの順に進む
- [x] P7では `collectedStars` に `castle` を追加しない
- [x] P7では `gameCompleted` を設定しない
- [x] 道後D0は背景準拠walkable polygonをruntime移動判定に利用する
- [x] P7 browser gateをP8後も維持する

## P8進行契約

- [x] `p8_kagemasa_route_unlocked` がない場合はボス導線を出さない
- [x] P7完了後に「天守奥へ進む」導線を表示する
- [x] P8進行をExploreScreenへ積み増さず `P8FlowController` へ分離する
- [x] P8監視は200ms intervalで行い、localStorageを描画フレームごとに読まない
- [x] ボス開始時にHP/MPを全回復する
- [x] ボス開始時に `card_star_seal` を解放する
- [x] `kagemasa_battle_started` を保存する

## カゲマサ戦不変条件

- [x] `enc_boss_kagemasa` を `isBoss: true` で開始する
- [x] カゲマサは通常ダメージだけではHP0にならない
- [x] カゲマサは通常ダメージだけでは勝利にならない
- [x] `sealGauge <= 0` の場合だけ正式勝利になる
- [x] 星封じカードでsealGaugeを削れる
- [x] P8 browser verifierで実際に星封じ勝利までBattleSystemを実行する

## P8完了Save不変条件

- [x] `defeatedEnemyIds` に `B-E01` を保持する
- [x] `flags.kagemasa_sealed === true`
- [x] `flags.mikan_core_recovered === true`
- [x] `acquiredItems.mikan_star_core >= 1`
- [x] `flags.castle_star_obtained === true`
- [x] `flags.star_castle_collected === true`
- [x] `collectedStars` に `castle` を追加する
- [x] `flags.pendant_light_restored === true`
- [x] `flags.dogo_restored === true`
- [x] `flags.castle_restored === true`
- [x] `flags.p8_completed === true`
- [x] `flags.gameCompleted === true`
- [x] P8完了直後は `currentScreenId === "ending"`
- [x] finalizationを単一関数で一括更新し、部分完了状態を作らない
- [x] `kagemasa_battle_started` なしのB-E01混入だけではP8完了扱いにしない

## EndingScreen契約

- [x] みかん星の核・城の星・ペンダント回復を文面で示す
- [x] 未解放の空白の星を残す
- [x] 星地図へ戻れる
- [x] タイトルへ戻れる
- [x] タイトルへ戻ってもEnding再開地点を上書きしない
- [x] タイトルの「つづきから」でEndingへ復帰できることをブラウザ回帰に含める

## Save/Battle既存不変条件

- [x] HP/MP/max値域を正規化する
- [x] ID配列をdedupeする
- [x] flagsはbooleanだけを採用する
- [x] 不正ScreenIdを既知画面へfallbackする
- [x] BattleSystem自身がphase/MP/アンロックカード/targetを検証する

## main / GitHub Pages Gate

- [ ] PR #5最終headで全Gate PASS
- [ ] mainへsquash merge
- [ ] main pushでも同じbuild gateを通過
- [ ] build成功後だけPages artifact upload/deploy
- [ ] P10で公開URLの新規セーブMVP E2Eを実行
