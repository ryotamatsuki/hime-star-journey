# 進捗管理: ひめの小さな星めぐり MVP

## 現在の状態

- 現在のフェーズ: **P10 通しプレイ・体験版調整・GitHub Pages公開確認（Release PASS）**
- P10作業開始時origin/main: `bdf66ae9c10c342ebd1f3ba38b60c7d4dbeecadd`
- P10 PR: #8、#9、#10、#11（Release Candidate、Production QA修正、手帳操作／レイアウト修正）
- 最終ラン: main #84（P7起動フレークを失敗ジョブ再実行後に全PASS、Pages deploy PASS）
- ランタイム最終main SHA: `8ba634a6e295db690cfd0e90c64a1b025e2b350f`
- 状態: CIフルプレイ、Save/Continue、Notebook、Audio、Production QAを完了。Release PASS。
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
| P10 | 通しプレイ・難易度調整・公開確認 | 完了（Release PASS） |

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

## P10 Production QA結果

- 公開URL: `https://ryotamatsuki.github.io/hime-star-journey/`
- title、新規ゲーム、プロローグ導入、道後到達、道後の目的表示を確認。
- 「旅の手帳 N」をpointerで開き、手帳内のミュート切替と「手帳を閉じる」をpointerで確認。
- reload後に「つづきから」が有効で、道後の安全な探索地点へ再開することを確認。
- ページ側のuncaught error、asset error、screen transition blockerはなし。Cloud Browser拡張由来のmetadata errorのみ観測。
- 本番URLでEndingまでの手動キー保持はCloud Browserの制約で未実施。Endingまでの通常操作はP10実Chrome CIで確認し、本番では主要公開経路を確認した。

## P10確認内容

- 新規localStorageからEndingまでの通常操作フルプレイ: PASS（最終CI #84、P10 browser）。
- 道後必須4戦、湯の星、松山城必須3戦、くらやみ井戸、城山のまもり、カゲマサ戦: PASS。
- Notebook序盤/道後完了/Ending後、10/10、旧save fail-safe、autosave/reload/Continue、battle途中checkpoint、ミュート: PASS。
- 1対2ターゲット確定の実画面処理を修正。必須連戦のMP枯渇を避けるため通常勝利後のMP少量回復を追加。
- `npm audit` と `npm audit --omit=dev`: 0 vulnerabilities。依存更新はbrace-expansion/js-yaml/nanoid/postcssの間接dev依存patch。


## Release判定

- **Release PASS**
- 残課題は新規コンテンツや性能計測などの任意拡張のみ。P10 Release blockerはなし。
