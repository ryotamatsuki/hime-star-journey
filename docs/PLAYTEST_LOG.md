# PLAYTEST_LOG

## プレイテスト観察項目

- 最初の目的が分かるか。
- 移動操作で迷わないか。
- 敵が何をしているか分かるか。
- 敵に近づくと戦闘になることが分かるか。
- 1対2戦闘で攻撃対象を選べるか。
- カードの意味が分かるか。
- HPとMPを見て判断できるか。
- 戦闘が長すぎないか。
- 道後温泉と松山城の違いが伝わるか。
- しずめた敵が消えることに達成感があるか。
- 旅の手帳を自然に開けるか。
- カゲマサが怖すぎず印象に残るか。
- MVP終了後に次の展開を期待できるか。

## 記録テンプレート

### Playtest-001

- 日時:
- プレイヤー:
- プレイ範囲:
- 詰まった場所:
- 楽しそうだった場所:
- 操作で困った点:
- 戦闘で困った点:
- 見えた言葉:
- 次に直すこと:

### Playtest-002

- 日時: 2026-08-26（JST）
- プレイヤー: Chrome/CI verifier（390px viewport、seed済みP12セーブ）
- プレイ範囲: 今治港Hub→橋道→橋の記憶→必須戦闘→海城の見張り台→風よみ→同じ風車の再訪→上島→必須戦闘→風の灯台→しまかぜ大だこ
- 詰まった場所: 初回はHubで航路図と橋道入口の近接判定が重なり、航路図が優先された。ポータル優先の近接順位へ修正後、CI #95で解消。
- 楽しそうだった場所: 風よみ取得前後で同じ風車のメッセージが変わり、上島への道が開く流れ。
- 操作で困った点: 390px幅でtouch移動UIとInteract buttonを表示し、critical pathを完走。
- 戦闘で困った点: P7〜P10回帰を含むChrome verifierでruntime error 0件。
- 見えた言葉: 「風車は止まっている」→「違う音」、橋道route、風の灯台。
- 次に直すこと: 60〜80分の人手通しプレイで、発見間隔中央値、無発見移動、checkpoint/autosave間隔を実測する。

判定: **P12実装／回帰Hard Gate PASS、探索KPI Hard Gate 条件付きPASS**（GitHub Actions Chrome CI #95）。

### Playtest-003

- 日時: 2026-08-26（JST）
- 対象: `feature/p12-1-shimanami-final-validation` のP12.1候補
- 開始時main SHA: `8bccc0941cbd57a89480406ce5ea1d64e766bdfa`
- プレイ範囲: A2 runtime、生成画像、walkable/collision、風field/battle rule、スマホDOM/CSS、production接続可否
- 多人数再現: 6つの独立role audit（実装監査3、初心者／iOS・Android／battle体験監査3）。ネットワーク協力プレイではなく、初心者・寄り道重視・critical path・iOS・Android・battleの観点を分離した代理評価。
- 結果: 本番背景6枚、敵3種、Boss、NPCの11 assetはmanifest・source/runtime・SHAが一致。A2-0〜A2-5の主要オブジェクト中心はPython計算で6/6 Areaがwalkable内。guide pathの歩行域外点は修正後0件。
- 実装確認: Area単位asset lazy loading、風rule、風よみ取得直後の風道、風車再訪、風のコンパス報酬、上島風壁ゲート、Shiro Search、横画面safe-area候補修正。
- 詰まった場所: ローカルChrome実体がなくP7〜P12 verifierを候補branchで実行できない。Cloud Browserからlocalhostはブロックされた。公開URLはP12.1未デプロイの旧mainであるため、候補画像・候補loadのproduction確認は未成立。
- 楽しそうだった場所: 風ruleの「白鷺札で追い風をため、次の一撃で解放」、同じ風車の再訪で風のコンパスを得る流れ、灯台Bossの風を閉じ込めるゲージ。
- 操作で困った点: iOS/Android相当の実操作は未実施。静的監査ではjoystick safe-area、手帳幅、星地図の390px高、6-card説明文の可読性にリスクが出たため修正したが、再実機確認は未完。
- 探索で困った点: Pythonの座標下限監査ではフィールド移動が短く、meaningful discoveryが数秒間隔に固まりやすい。60〜80分を支える密度の人手証拠はない。
- 計測値: A2総時間、Subarea時間、discovery interval、中央値、最大値、60秒超区間、longest empty walk、分岐→報酬、checkpoint/autosave、通常戦、Boss、iOS/Android、候補production loadは **未計測**。推測値をHard Gateには使わない。
- 静的／build結果: `npm ci`、typecheck、lint、maps:validate、editor:smoke、buildはPASS。P12.1候補のbrowser verifierはChrome環境不足でBLOCKED。

判定: **P12 NO-GO / REVISION REQUIRED**。画像・runtime統合は次候補まで進んだが、手動Hard Gateとproduction QAを閉じていない。P13へ進まない。

### Playtest-004 / A2-4導線修正

- 日時: 2026-08-27（JST）
- 対象: P12.1 branch の Actions #102 failure 後の候補修正
- 根因: A2-4の必須敵 A2-E03（くろほガモメ）が、上島の記憶から風の近道へ向かう途中（旧座標 940,560）にあり、近道を調べる前に戦闘へ入っていた。
- 修正: A2-E03を風の近道後の灯台ルート上へ移し、Verifierの戦闘到達座標も同期した。中間候補 `(1525,560)` の後、背景上の実道とA2全域geometryを再監査し、現行候補を `(1500,850)` へ更新した。
- 静的検証: A2-0〜A2-5主要オブジェクトの歩行域内、A2-4近道前の敵衝突0件、近道後の意図したA2-E03衝突を確認。typecheck、lint、maps:validate、editor:smoke、build、git diff --checkはPASS。
- GitHub Chrome CI: 修正commit反映後の再実行待ち。
- 判定: 手動60〜80分Hard Gate、スマホQA、production QAは未成立。推測でPASSに変更しない。

### Playtest-005 / P12.1候補のruntime・導線・保存ハードニング

- 日時: 2026-08-27（JST）
- 対象: `feature/p12-1-shimanami-final-validation` の #102 failure 後の候補実装
- 根因整理: A2-4の必須敵 A2-E03 が風の近道へ向かうcritical path上に残り、Verifierが想定外戦闘を移動完了と誤認していた。さらに、A2-0〜A2-4の任意敵にも同型の導線衝突リスクがあった。
- 修正: 任意敵をcritical pathから外し、A2-4の風壁を通過後にA2-E03→灯台の順で進める座標へ再配置した。橋道／小舟道のroute選択を一度きりにし、見張り台への遷移には選択routeの必須敵撃破を要求する。
- 保存／telemetry: 戦闘開始時に安全な復帰位置と `battle_start`／`boss_start` を保存し、勝利時に即時保存する。area exit、autosave、checkpoint、battle duration、Boss duration、reloadをイベントログで照合できる形へ拡張した。
- Smartphone候補修正: 会話中の移動UIを隠し、safe-areaを反映。横画面のBattle message／6-card UIを再配置し、狭い横画面では3列へフォールバックする。
- 検証状態: Pythonによるwalkable／collision／interactable監査と、A2全域の開始地点・敵コライダー・guide pathを含む `maps:validate`、typecheck、lint、editor:smoke、buildはPASS。候補branchのChrome CI、通常操作60〜80分、人手KPI、iOS/Android相当操作、production QAは未完了。

判定: **P12 NO-GO / REVISION REQUIRED**。候補実装は更新したが、ブラウザCIと人手Hard Gateの証拠がないため、merge・P13移行は保留する。

### Playtest-006 / P12.1 Final Candidate QA

- 日時: 2026-09-03（JST）
- 対象: PR #16 `feature/p12-1-shimanami-final-validation`
- 基準main: `8bccc0941cbd57a89480406ce5ea1d64e766bdfa`
- Chrome CI: Actions #123 (`33696821948`)、code candidate HEAD `7e9fb2da52108ca620e2bb640594d5d2b2ca7c5d` で `git diff --check`、npm ci、typecheck、lint、maps:validate、editor:smoke、build、P7、P8、P9、P10、P11、P12を同一runでPASS。
- P10 #104回帰: safe battle return導入後もP10 verifierがD-E03戦後の旧直線導線を仮定していたことが原因。runtimeの湯の星は通常interaction可能であり、verifierを実道・実interaction・現行StarMap contractへ追随させてclosureした。
- P12 browser: 橋道route、帆パズル、A2-E01、風よみ、同じ風車revisit、風のコンパス、上島の風壁／近道、A2-E03、灯台、Boss、victory save、telemetryまでfail-closedでPASS。A2-E03戦後はwalkable内・collision外・敵collider外の安全復帰を意味的に検証。
- Production visual: Actions visual QA bundleの実PNGを表示し、背景6枚、敵3種、Boss、NPCを独立確認。11 runtime assetのSHA256はmanifestと11/11一致。
- Walkable/collision overlay: A2-0〜A2-5の本番背景へwalkable、collision、guide path、objectを重ねて確認。A2-0で小舟用walkableがフェリー船体側へ食い込むHighを検出し、船体側branchを撤去して石畳岸壁のみwalkableに変更。boat portalも岸壁側へ移動した。
- Interaction: A2-3の風車／上島portal、A2-2のreward／portalは配置を分離。A2-2の星のかけらはSave正規化で1個上限とし、再interactionによる無限取得を防止。
- Lazy loading: TitleはP12 assetをcore manifestから除外し、Shimanami入場後に現在Areaの背景・敵・NPCのみ `loadAreaAssets()` する構造を確認。明白なblocking issueなし。final performance数値は次工程で測る。
- Independent review: runtime/save、P10 compatibility、map/geometry、visual、interaction/child navigation、battle/wind/return、lazy loading/assets、full diff/test adequacyの8 roleで独立review passを実施。Critical 0、High 0。Medium/Observationとして、小舟routeの完全browser E2Eは人手Gateへ残ること、A2-4の風shortcutは能力で可視化される草地shortcutであること、Area asset非同期ロード時の短時間fallback可能性を記録。
- 未実施: 60〜80分人手通常操作、exploration KPI本計測、iOS/Android実機相当Final QA、merge後production QA、Final P12判定。

候補判定: **READY FOR MANUAL HARD GATE**。P12 FINAL PASSではない。PR #16はmergeしない。次工程は60〜80分人手通常操作Hard Gateであり、P13は開始しない。
