# ROADMAP

## フェーズ一覧

| ID | フェーズ | 目的 | 状態 |
|---|---|---|---|
| P0 | リポジトリ初期化 | ルール、仕様、進捗管理、アセット管理、プロンプト整備 | 完了 |
| P1 | 基盤実装 | TypeScript + Vite + Canvas + DOM UI + セーブ基盤 | 完了 |
| P2 | アセット・アニメーション基盤 | 生成アセット、SpriteAnimator、2.5D風表現 | 完了 |
| P3 | 探索画面 | ひめ移動、シロ追従、敵シンボル、接触判定 | 完了 |
| P4 | 星地図 | 道後温泉、松山城、未解放星、目的地選択 | 完了 |
| P5 | 複数敵対応バトル | EncounterData、BattleActor配列、ターゲット選択、カード効果 | 完了 |
| P5.1 | 戦闘画面レイアウト改善 | 道後温泉通常戦闘専用背景、配置、カードUI、可読性調整 | 完了 |
| P5.9 | ストーリー正本復元・企画書整合 | 星守り、みかん星の核、シロ、カゲマサ、くろぼし設定を整合 | 完了 |
| P6 | プロローグ／道後温泉体験版 | ペンダント、シロ、核奪取、道後異変、湯の星、松山城解放 | 完了 |
| P6.5 | ローカル開発用マップエディタ | 道後D0/松山城C0の歩行・衝突・配置・道しるべ編集 | 完了 |
| P7 | 松山城探索・松山城クエスト | `castle/C0`、C-E01〜C-E04、くらやみ井戸、城山のまもり | 完了 |
| P7.1 | Release Hardening | 入力経路整合、Save/Battle不変条件、仕様同期、CI Release Gate | 完了 |
| P7.2 | 道後歩行領域実景整合 | 背景上の地面とwalkable polygonを一致させる | 完了 |
| P8 | カゲマサ戦・みかん星の核奪還・MVPエンディング | 星封じ、再封印、核奪還、城の星、終了演出 | 完了 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 手帳、進行メモ、オートセーブ、音まわりの最小整理 | 完了 |
| P10 | 通しプレイ・体験版調整・GitHub Pages公開確認 | 新規セーブMVP通し、難易度・操作感、公開URL、Release確認 | 完了（Release PASS） |

## P9 runtime正本

- `NotebookScreen` に旅の手帳10項目を実装し、進行flag/取得状態でページ解放を判定する。
- 手帳には最新あらすじ、地域メモ、取得済み星、解放済みカード、最終保存時刻を表示する。
- 探索・星地図・エンディングからNキーまたはDOMボタンで手帳を開ける。
- 手帳表示中はセーブの `currentScreenId` を `notebook` へ書き換えず、元の安全な再開地点を保持する。
- `AudioManager` はWeb Audio APIでタイトル/道後/松山城/戦闘/星地図/手帳の最小BGMパターンとUI SEを提供する。
- ブラウザ自動再生規約に従い、最初のpointer/keyboard操作後にAudioContextを開始する。
- `P9ExperienceController` はexplore/starMap/endingのみを安全なオートセーブcheckpointとして同期し、battle/prologue/notebook/titleは除外する。
- `p9:browser` をRelease Gateへ追加し、P7/P8/P9の実Chrome回帰を直列実行する。

## P9完了確認

- PR #7 run #44で `npm ci`、typecheck、lint、maps:validate、editor:smoke、build、P7 browser、P8 browser、P9 browserが全てPASS。
- P9 browserでは手帳10項目、進行ロック、手帳開閉、カード一覧、地域メモ、ミュートUI、再開地点非上書き、安全画面オートセーブを確認。
- GameApp起動時間はP9 verifier内で計測・ログ出力し、P10 production E2Eで公開環境の実測値を最終確認する。

## P10 Release Gate完了

- PR #8〜#11でP10のRelease Candidate、Production QA修正、手帳操作修正を実施。最終mainラン #84はP7起動フレークの失敗ジョブ再実行後に全GateとPages deployをPASS。
- P10 verifierは新規セーブからタイトル→プロローグ→道後必須4戦→湯の星→星地図→松山城必須3戦→くらやみ井戸→城山のまもり→カゲマサ→Endingを通常のDOM/キーボード操作で完走。
- 手帳の段階解放、10/10、旧save fail-safe、autosave/reload/Continue、battle途中checkpoint、Ending後Continue、ミュート切替、390px相当タッチパッド、runtime image asset path、runtime error 0件を確認。
- 1対2戦闘のターゲット確定処理を修正し、必須連戦でMPが枯れないよう通常勝利後にMPを少量回復する調整を追加。
- `npm audit` / `npm audit --omit=dev` はともに0 vulnerabilities。以前の4 highは間接dev依存の安全なpatch更新で解消。
- GitHub Pages本番URLでtitle、新規開始、道後到達、手帳の開く／ミュート／閉じるpointer操作、reload後のContinue、最新bundleのロードを確認。ページ側console/runtime blockerとasset errorはなし。
- 本番URLの手動Endingまでのキー長押しはCloud Browserの入力保持制約で未実施。Endingまでの通常操作はCI実Chromeで確認し、本番では主要story入口と再開経路を確認した。
- ランタイム最終main SHA: `8ba634a6e295db690cfd0e90c64a1b025e2b350f`。

## 次フェーズ

MVP体験版のRelease blockerは残っていない。今後は新しい地域・物語を追加する場合に、P10のbrowser/production Gateを回帰基準として維持する。
