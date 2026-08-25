# BUILD_CHECKLIST

このチェックリストはP9完了時点のRelease Gate記録です。

## PR #7 Release Gate

- [x] `npm ci`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run maps:validate`
- [x] `npm run editor:smoke`
- [x] `npm run build`
- [x] P7/P8/P9 verifier URLがHTTP 200
- [x] Linux Chrome `npm run p7:browser`
- [x] Linux Chrome `npm run p8:browser`
- [x] Linux Chrome `npm run p9:browser`
- [x] PRではPages configure/upload/deployをskip
- [x] PR #7 run #44で全Gate PASS

## P9 旅の手帳契約

- [x] 旅の記録は10項目
- [x] 進行状態に応じて未解放ページを残す
- [x] 最新あらすじを表示
- [x] 地域メモを表示
- [x] 取得済み星を表示
- [x] 解放済みカード一覧を表示
- [x] 最終保存時刻を表示
- [x] explore/starMap/endingからNキーまたはDOMボタンで開ける
- [x] Notebook表示で保存済み `currentScreenId` を `notebook` へ上書きしない
- [x] Notebookを閉じると元の安全な画面へ戻る

## P9 Audio契約

- [x] Web Audio APIだけで最小BGM/SEを実装し外部音源依存を増やさない
- [x] title/dogo/castle/battle/stars/notebookでBGMパターンを切り替える
- [x] UI操作SEを提供する
- [x] AudioContextは最初のユーザー操作後に開始する
- [x] 手帳からミュート状態を切り替えられる
- [x] `GameApp.stop()` でAudioContext/timer/event listenerを破棄する

## P9 AutoSave契約

- [x] explore/starMap/endingだけを安全なcheckpoint同期対象にする
- [x] battle/prologue/notebook/titleではcheckpointを書き換えない
- [x] `flags.autosave_enabled === true` を保存する
- [x] 手帳を開いても再開地点を失わない
- [x] P9 browserでexplore checkpoint同期を実ブラウザ確認する

## P9 browser契約

- [x] 手帳10項目を検証
- [x] MVP完了セーブで10/10解放を検証
- [x] 初期セーブでは未解放ページが残ることを検証
- [x] 実探索画面に「旅の手帳 N」を表示
- [x] 手帳画面の記録・カード・地域メモ・オートセーブ表示を検証
- [x] ミュートUI切替を検証
- [x] 手帳表示中もresume screenを保持することを検証
- [x] GameApp起動時間をverifierログへ出力

## P10 Release Gate（最終main #84）

- [x] `npm ci`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run maps:validate`
- [x] `npm run editor:smoke`
- [x] `npm run build`
- [x] `npm run p7:browser`
- [x] `npm run p8:browser`
- [x] `npm run p9:browser`
- [x] `npm run p10:browser`（最終CI #84）
- [x] 新規localStorageからタイトル→EndingまでのCI実Chrome完全E2E
- [x] 道後必須4戦、松山城必須3戦、くらやみ井戸、カゲマサ戦の通常操作完走
- [x] Notebook段階解放、10/10、autosave/reload/Continue、battle途中checkpoint、Ending後Continue
- [x] 390px相当viewportのタッチパッド表示、1対2ターゲット確定、ミュートUI
- [x] Console runtime error 0件、runtime image asset path確認
- [x] `npm audit` / `npm audit --omit=dev` ともに0 vulnerabilities
- [x] merge後GitHub Pages Production E2E（title、新規開始、道後、Notebook pointer、ミュート／閉じる、reload→Continue）
- [ ] 公開Pagesの初期ロード時間を数値実測し、必要ならAssetManifestを段階ロード化（任意の性能改善）
- [x] 公開環境のConsole error / HTTP 4xx / 必須asset欠落なしを確認（ページ側。拡張機能由来ログは除外）

## P10最終判定

- [x] Full Playthrough: 最終P10実Chrome CIで新規セーブからEndingまでPASS
- [x] Save/Continue: autosave、reload、Notebook中の安全地点保持、Ending後Continue PASS
- [x] Notebook: 10項目、段階解放、pointerで開く／ミュート／閉じる、10/10 PASS
- [x] Audio: autoplay policy、画面切替、ミュート、重複再生 blockerなし
- [x] Console/runtime blocker: 0（Cloud Browser拡張のmetadata errorのみ）
- [x] npm audit / npm audit --omit=dev: 0 vulnerabilities
- [x] GitHub Pages Production QA: PASS
- [x] ランタイム最終main SHA: `8ba634a6e295db690cfd0e90c64a1b025e2b350f`

本番URLのEndingまでの手動キー保持はCloud Browserの入力制約で未実施。最終判定は、実Chrome CIの完全E2EとPages本番主要経路QAを合わせて **Release PASS** とした。
