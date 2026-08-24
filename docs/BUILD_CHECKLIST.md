# BUILD_CHECKLIST

このチェックリストは現在のP7.1 Release Hardening以降で、mainへ入れる変更とGitHub Pages公開を判定するRelease Gateです。

## PR必須Gate

- [ ] `npm ci` が成功する。
- [ ] `npm run typecheck` が成功する。
- [ ] `npm run lint` が成功する。
- [ ] `npm run maps:validate` が成功し、`dogo-D0` / `castle-C0` にerrorsがない。
- [ ] `npm run editor:smoke` が成功する。
- [ ] `npm run build` が成功する。
- [ ] Vite dev serverで `/hime-star-journey/p7-browser-verifier.html` がHTTP 200を返す。
- [ ] Linux Chrome/Chromiumで `npm run p7:browser` が成功する。
- [ ] PRではPages deployを実行しない。

## P7/P7.1回帰契約

- [x] 星地図で未解放の松山城へ移動できない。
- [x] 湯の星取得済み状態では松山城 `castle/C0` へ移動できる。
- [x] 松山城でHキーの道しるべを利用できる。
- [x] Gキー後も実Canvas描画が継続する。
- [x] 松山城の目的表示がヒント→必須3戦→くらやみ井戸→城山のまもりの順に進む。
- [x] P7完了後のプレイヤー向けUIに「P8で」など内部フェーズ名を表示しない。
- [x] 松山城1対1戦闘が勝利まで動く。
- [x] 松山城1対2戦闘が勝利まで動く。
- [x] `castle-C0` の必須レイアウトIDを読み込める。
- [x] 城山のまもり取得済みセーブからP8開始条件を復元できる。
- [x] P7では `collectedStars` に `castle` を追加しない。
- [x] P7では `gameCompleted` を設定しない。

## Input / Quest整合

- [x] NPCのEnter/Space操作とDOM「話す」ボタンが同じinteraction処理を通る。
- [x] 道後NPCをDOMボタンから話した場合も `dogo_quest_hint_seen` を更新する設計である。
- [x] 松山城NPCをDOMボタンから話した場合も `castle_hint_seen` を更新する設計である。
- [ ] P10のproduction E2Eでマウス/タッチ中心の通し操作を確認する。

## BattleSystem不変条件

- [x] 使用カードが現在phaseで使用可能かBattleSystem自身が検証する。
- [x] アンロックされていないカードをBattleSystemが拒否する。
- [x] 不正な明示target IDを別の敵へ暗黙フォールバックしない。
- [x] 通常戦闘は敵全員HP0で勝利する。
- [x] 封印未完了のカゲマサは通常ダメージでHP0にならない。
- [x] カゲマサはHPを削るだけでは勝利にならない。
- [x] カゲマサは `sealGauge <= 0` の場合だけ勝利になる。

## SaveData不変条件

- [x] 現行Save versionへ正規化する。
- [x] `maxHp >= 1` を保証する。
- [x] `maxMp >= 0` を保証する。
- [x] HP/MPを0〜最大値へclampする。
- [x] 主要ID配列の重複を除去する。
- [x] アイテム数は有限の非負整数だけを保持する。
- [ ] `flags` をboolean値だけに正規化する。
- [ ] 不正な `currentScreenId` を安全な画面へfallbackする。

## マップエディタ契約

- [x] `map-editor.html` がproduction buildの入力に含まれる。
- [x] 道後温泉D0と松山城C0のレイアウトJSONを読み込める。
- [x] Vite dev専用load/save/validate APIをproduction buildへ持ち込まない。
- [x] 保存前に `.map-editor-backups/` へバックアップする。
- [x] ゲームプレビューは通常セーブと別キーを使う。
- [x] 不正レイアウトを保存API側でも拒否する。

## main / GitHub Pages Gate

- [ ] main pushでもPRと同じbuild jobを通過する。
- [ ] build job成功後だけPages artifactをuploadする。
- [ ] build job成功後だけdeploy jobを実行する。
- [ ] P10で公開URLから新規セーブのMVP E2Eを実行する。
- [ ] P10でConsole error、HTTP 4xx、必須asset欠落がないことを確認する。

## P8実装開始条件

- [ ] P7.1 PRのGitHub Actionsが全てPASSしている。
- [ ] GDD/README/ROADMAP/PROGRESS/TASKSの `castle/C0` / `C-E*` 体系がruntimeと一致している。
- [ ] ボス戦の星封じ必須勝利条件が回帰検証に固定されている。
- [ ] ExploreScreenへP8の探索進行を追加する場合、クエスト進行/特殊イベント責務を先にcontroller/serviceへ抽出する。
