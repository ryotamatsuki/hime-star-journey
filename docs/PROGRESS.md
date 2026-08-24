# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 完了フェーズ: **P9 旅の手帳・BGM/SE・セーブ調整**
- P9作業開始時main: `df3b6d6b02ffb307019789a5b988089a8defbc45`
- P9 PR: #7 `feat(p9): add travel notebook, audio, and autosave tuning`
- 検証: PR #7 run #44でP7/P8/P9実Chromeを含む全Release Gate PASS。
- 次フェーズ: **P10 通しプレイ・体験版調整・GitHub Pages公開確認**
- 最終更新日: 2026-08-25

## フェーズ別進捗

| ID | フェーズ | 状態 |
|---|---|---|
| P0〜P5.9 | 基盤・探索・星地図・会話・複数敵バトル・ストーリー整合 | 完了 |
| P6 | プロローグ・道後温泉クエスト・湯の星 | 完了 |
| P6.5 | ローカルマップエディタ | 完了 |
| P7 | 松山城探索・松山城クエスト | 完了 |
| P7.1 | Release Hardening | 完了 |
| P7.2 | 道後D0歩行領域の実景整合 | 完了 |
| P8 | カゲマサ戦・核奪還・MVPエンディング | 完了 |
| P9 | 旅の手帳・BGM/SE・セーブ調整 | 完了 |
| P10 | 通しプレイ・難易度調整・公開確認 | 次フェーズ |

## P9完了内容

- `NotebookScreen` と10項目の `notebookEntries` を追加。
- ペンダント、シロ、核奪取、道後、湯の星、松山城、くらやみ井戸、城山のまもり、カゲマサ再封印までを進行に応じて解放。
- 手帳に最新あらすじ、地域メモ、取得星、解放カード、最終保存時刻を表示。
- 探索・星地図・エンディングからNキー/DOMボタンで開閉し、手帳表示中は保存済み再開地点を保持。
- `AudioManager` を追加し、タイトル/道後/松山城/戦闘/星地図/手帳のWeb Audio BGMパターンとUI SEを実装。
- AudioContextは最初のユーザー操作後に開始し、ブラウザのautoplay policyに対応。
- 手帳にミュート操作を追加。
- `P9ExperienceController` を追加し、explore/starMap/endingだけを2秒間隔の安全なオートセーブcheckpointとして同期。
- battle/prologue/notebook/titleはcheckpoint同期対象外。
- `GameLoop` にglobal control用pre-frame hookを追加し、Nキー手帳導線と音同期を画面固有ロジックから分離。
- `p9:browser` を追加し、GitHub ActionsをP7→P8→P9 browserの直列Release Gateへ拡張。
- P9 verifier内でGameApp起動時間を計測し、P10の公開Pages実測と比較できるようログ化。

## Release Gate

PR #7 run #44:

| Gate | 結果 |
|---|---|
| `npm ci` | PASS |
| typecheck | PASS |
| lint | PASS |
| maps:validate | PASS |
| editor:smoke | PASS |
| build | PASS |
| P7 browser | PASS |
| P8 browser | PASS |
| P9 browser | PASS |
| PR Pages deploy | SKIPPED（設計どおり） |

## 次の判断

P10へ進む。新規localStorageからタイトル→Endingまで完全通しし、キーボード/マウス/タッチ、低年齢向け難易度、BGM/SE音量、手帳の段階解放、公開Pagesの初期ロード時間、404/console error/必須asset欠落を最終確認する。
