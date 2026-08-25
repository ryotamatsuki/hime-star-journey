# ひめの小さな星めぐり（仮）

愛媛県内20市町への将来拡張を見据えた、手描き絵本風2.5D探索RPGのMVP開発リポジトリです。MVPでは松山市内の「道後温泉エリア」と「松山城エリア」に範囲を絞り、探索、星地図、シンボルエンカウント、カード式ターン制バトル、旅の手帳、オートセーブを実装対象にします。

## 現在のフェーズ

P10「通しプレイ・体験版調整・GitHub Pages公開確認」はRelease PASSです。実Chromeの新規セーブ通しプレイ、P7〜P10回帰、GitHub Pages本番QAを完了しています。

P9 runtimeの正本:

- `NotebookScreen` に旅の記録10項目を実装。進行に応じてページが解放される。
- 手帳には最新あらすじ、地域メモ、取得済み星、解放済みカード、最終保存時刻を表示。
- 探索・星地図・エンディングではNキーまたは「旅の手帳 N」ボタンから開ける。
- 手帳を開いてもセーブの再開地点を `notebook` へ上書きしない。
- `AudioManager` で画面/地域別のWeb Audio BGMパターンとUI SEを実装。最初のユーザー操作後に開始する。
- 手帳からBGM/SEをミュートできる。
- `P9ExperienceController` が安全な画面（explore/starMap/ending）の再開地点だけを2秒間隔でオートセーブ同期する。
- battle/prologue/notebook/titleはオートセーブcheckpoint書換え対象外。
- P10では390px相当viewportの4方向タッチパッド、P10実Chromeフルプレイ verifier、1対2ターゲット確定、連戦時のMP回復を追加・調整した。
- 本番QAで発見した手帳ボタン／手帳ヘッダーのpointer操作不具合を修正し、viewport内で開く・ミュート・閉じる操作を確認した。

主な実装状況:

- P6: 画像付き6シーンプロローグ、道後温泉クエスト、湯の星、星地図・松山城解放。
- P6.5: `map-editor.html` による道後D0/松山城C0レイアウトの視覚編集・検証・保存。
- P7: 星地図→松山城C0、城内戦闘、NPC/調べるヒント、くらやみ井戸、城山のまもり。
- P7.1: NPC入力経路統一、Save/Battle不変条件、実ブラウザCI Release Gate。
- P7.2: 道後D0の背景上の地面とwalkable polygonを整合。
- P8: カゲマサ戦、星封じ、核奪還、城の星、MVP完了保存、EndingScreen。
- P9: 旅の手帳、Web Audio BGM/SE、安全画面オートセーブ、P9実Chrome Gate。

## 技術方針

- 言語: TypeScript
- ビルド: Vite
- 描画: HTML Canvas 2D API
- UI: DOM / CSS
- 音: Web Audio API
- セーブ: localStorage
- ループ: requestAnimationFrame

ゲームエンジンやゲームフレームワークは使いません。最終章の状態遷移は `P8FlowController`、P9の手帳導線・音同期・オートセーブは `P9ExperienceController` へ分離しています。

## MVP範囲

- タイトル画面
- プロローグ
- 道後温泉探索
- 松山城探索
- 星地図
- 敵シンボル接触による戦闘
- 1対1および1対2のカード式ターン制バトル
- カゲマサとの1対1ボス戦
- 旅の手帳
- BGM/SE
- オートセーブと「つづきから」
- MVPエンディング

## 開発・検証コマンド

```bash
npm ci
npm run typecheck
npm run lint
npm run maps:validate
npm run editor:smoke
npm run build
npm run dev
npm run p7:browser
npm run p8:browser
npm run p9:browser
npm run p10:browser
npm audit
```

公開URL:

```text
https://ryotamatsuki.github.io/hime-star-journey/
```

P10最終CI #84（P7起動フレークの失敗ジョブ再実行後）は `npm ci`、typecheck、lint、map/editor検証、build、P7/P8/P9/P10実Chrome回帰、Pages deployをすべてPASSしています。P10 verifierは新規セーブからEndingまで、手帳、autosave/reload/Continue、音量切替、runtime error、runtime image asset pathを確認します。GitHub Pages本番QAではtitle、新規開始、道後到達、手帳のpointer操作、ミュート、閉じる、reload後のContinueを確認しました。

P10のランタイム最終main SHAは `8ba634a6e295db690cfd0e90c64a1b025e2b350f` です（PR #8〜#11、PR #11 merge後のmain）。Cloud Browserのキー長押し制約のため、本番URLではCIと同じEndingまでの手動入力は再現していませんが、CIの実Chromeフルプレイと本番主要操作QAはPASSです。ページ側のconsole/runtime blockerはなく、確認された拡張機能由来ログはRelease判定から除外しています。
