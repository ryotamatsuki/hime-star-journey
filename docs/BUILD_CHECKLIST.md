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

## P10 Release前最終Gate

- [ ] 新規localStorageからタイトル→Endingまでproduction完全E2E
- [ ] キーボード中心・マウス/タッチ中心の双方で主要導線を確認
- [ ] 旅の手帳を序盤/道後完了/P7完了/P8完了の各時点で確認
- [ ] BGM/SEの音量・切替・長時間再生を実機確認
- [ ] 公開Pagesで初期ロード時間を実測し、必要ならAssetManifestを段階ロード化
- [ ] Console error / HTTP 4xx / 必須asset欠落なしを確認
- [ ] `npm audit` が報告している依存パッケージ脆弱性を公開前に分類し、必要な更新を判断する
