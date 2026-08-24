# BUILD_CHECKLIST

このチェックリストはP8完了時点のRelease Gate記録です。

## PR #5 Release Gate

- [x] `npm ci`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run maps:validate`
- [x] `npm run editor:smoke`
- [x] `npm run build`
- [x] P7/P8 verifier URLがHTTP 200
- [x] Linux Chrome `npm run p7:browser`
- [x] Linux Chrome `npm run p8:browser`
- [x] PRではPages configure/upload/deployをskip
- [x] docs-only final head run #36でも全Gate PASS
- [x] PR #5をsquash merge
- [x] main SHA `22b9cc2d30dcfbc2b41e5936b68f67717a195912`

## P8 runtime契約

- [x] `p8_kagemasa_route_unlocked` からボス導線を表示
- [x] P8進行を `P8FlowController` へ分離
- [x] 200ms interval監視でlocalStorageの毎フレームreadを回避
- [x] ボス開始時にHP/MP全回復・`card_star_seal` 解放
- [x] `enc_boss_kagemasa` / `B-E01` / `isBoss: true`
- [x] 通常ダメージだけではカゲマサHP0/勝利にならない
- [x] `sealGauge <= 0` のみ正式勝利
- [x] `completeP8Save()` でP8最終状態を一括保存

## P8最終Save契約

- [x] `defeatedEnemyIds` includes `B-E01`
- [x] `flags.kagemasa_sealed === true`
- [x] `flags.mikan_core_recovered === true`
- [x] `acquiredItems.mikan_star_core >= 1`
- [x] `flags.castle_star_obtained === true`
- [x] `collectedStars` includes `castle`
- [x] `flags.pendant_light_restored === true`
- [x] `flags.dogo_restored === true`
- [x] `flags.castle_restored === true`
- [x] `flags.p8_completed === true`
- [x] `flags.gameCompleted === true`
- [x] 完了直後 `currentScreenId === "ending"`
- [x] `kagemasa_battle_started` なしのB-E01混入だけではP8完了にしない

## EndingScreen契約

- [x] みかん星の核・城の星・ペンダント回復を表示
- [x] 未解放の空白の星を表示
- [x] 星地図へ戻れる
- [x] タイトルへ戻れる
- [x] タイトルへ戻ってもEnding checkpointを上書きしない
- [x] 「つづきから」でEndingへ復帰する実ブラウザ回帰あり

## P9/P10へ残すGate

- [ ] P9で旅の手帳/BGM-SE/セーブ調整後の全Gate
- [ ] P9でAssetManifest初期ロード時間を実測
- [ ] P10で公開Pagesの新規セーブ完全E2E
- [ ] P10でConsole error / HTTP 4xx / 必須asset欠落なしを確認
