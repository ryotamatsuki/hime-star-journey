# TASKS

このファイルは現在フェーズ以降の実行タスクを管理します。完了済みフェーズの詳細履歴は `docs/PROGRESS.md` とGit履歴を参照してください。

## P7.1 Release Hardening

### 進行・UI

- [x] キーボードのNPC会話とDOM「話す」ボタンを同一interaction処理へ統一
- [x] マウス/タッチ経路でも道後・松山城のヒント既読flagを更新
- [x] プレイヤー向け目的表示から内部フェーズ名「P8」を除去

### BattleSystem

- [x] `applyBattleCard()` 内でphase/MP/アンロック済みカードを再検証
- [x] 不正な明示target IDを先頭敵へフォールバックしない
- [x] 封印未完了のカゲマサHPを通常攻撃で0にできないようにする
- [x] ボス戦勝利条件を `sealGauge <= 0` のみにする
- [x] ブラウザ回帰検証に「通常攻撃では勝てない／星封じで勝つ」を追加

### SaveData

- [x] `maxHp >= 1` / `maxMp >= 0` を保証
- [x] HP/MPを0〜最大値へclamp
- [x] ID配列の重複を除去
- [x] 不正なアイテム所持数を除去し非負整数へ正規化
- [x] `flags` をboolean値だけに正規化
- [x] 不正な `currentScreenId` を既知画面へfallback
- [x] chapter/location/areaの非文字列・空文字を既定値へfallback

### Browser / CI

- [x] P7 verifierのfake Canvas差し替えを除去
- [x] 実Canvas `toDataURL()` で描画継続を確認
- [x] Windows固定Chromium依存を緩和しLinux Chrome/Chromium探索に対応
- [x] PRでもGitHub Actionsを実行
- [x] CIへ `maps:validate` を追加
- [x] CIへ `editor:smoke` を追加
- [x] CIへ実ブラウザ `p7:browser` を追加
- [x] main deployを全Gate通過後に限定
- [ ] PR上のGitHub Actionsで全Gate PASSを確認

### 仕様・台帳

- [x] `PROGRESS.md` をP7.1時点の正本へ更新
- [x] `ROADMAP.md` にP7.1を追加
- [x] READMEをP7.1とRelease Gateへ更新
- [x] GDDの旧 `M0〜M6` / `M-E01〜M-E08` をruntime `castle/C0` / `C-E01〜C-E05` へ同期
- [x] GDDへカゲマサの星封じ必須勝利条件を明記
- [x] TASKSを現行タスクへ整理
- [x] BUILD_CHECKLISTを現行Release Gateへ整理
- [x] BUGSへP7.1で解決した不具合と残課題を整理

## P8 カゲマサ戦・みかん星の核奪還・MVPエンディング

- [ ] P7.1 Release Gate通過を開始条件とする
- [ ] ExploreScreenへ新規クエスト条件を積み増す前に、クエスト進行/特殊イベント責務をcontroller/serviceへ抽出
- [ ] `p8_kagemasa_route_unlocked` からボス導線へ接続
- [ ] 星封じカードの進行上の解放
- [ ] カゲマサ戦UIで封印が勝利条件だと明確に伝える
- [ ] 通常ダメージだけで勝てないことを保持
- [ ] 星封じゲージ完了でカゲマサ再封印
- [ ] みかん星の核奪還
- [ ] ペンダントの光回復
- [ ] 城の星取得
- [ ] `collectedStars` へ `castle` を追加
- [ ] MVP終了演出
- [ ] 未解放の空白星を表示
- [ ] `gameCompleted` 相当の完了状態を仕様と実装で一致させる
- [ ] P8ブラウザ回帰検証を追加

## P9 旅の手帳・BGM/SE・セーブ調整

- [ ] 旅の手帳10項目
- [ ] 解放済みカード一覧
- [ ] 地域メモ
- [ ] あらすじ
- [ ] オートセーブ調整
- [ ] BGM/SEの最小整理
- [ ] P8/P9追加アセット後の初期ロード時間を実測
- [ ] 必要な場合だけboot/area/battle/endingの段階ロードへ変更

## P10 通しプレイ・体験版調整・公開確認

- [ ] 新規localStorageからMVP通しプレイ
- [ ] タイトル→プロローグ→道後全必須戦闘→湯の星→星地図→松山城→城山のまもり→カゲマサ→エンディングを確認
- [ ] マウス/タッチ中心の操作経路を確認
- [ ] キーボード中心の操作経路を確認
- [ ] 旧セーブ移行を確認
- [ ] 道後walkable/collisionの細部を目視調整
- [ ] 難易度・短文・低年齢向け導線を調整
- [ ] GitHub Pages公開URLでproduction E2E
- [ ] コンソールエラー/404/必須アセット欠落なしを確認
- [ ] Release checklist全項目PASS
