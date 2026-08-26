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





\n### Playtest-004 / A2-4導線修正

- 日時: 2026-08-27（JST）
- 対象: P12.1 branch の Actions #102 failure 後の候補修正
- 根因: A2-4の必須敵 A2-E03（くろほガモメ）が、上島の記憶から風の近道へ向かう途中（旧座標 940,560）にあり、近道を調べる前に戦闘へ入っていた。
- 修正: A2-E03を風の近道後の灯台ルート上（1440,540）へ移し、Verifierの戦闘到達座標も同じ実導線へ同期した。
- 静的検証: A2-0〜A2-5主要オブジェクトの歩行域内、A2-4近道前の敵衝突0件、近道後の意図したA2-E03衝突を確認。typecheck、lint、maps:validate、editor:smoke、build、git diff --checkはPASS。
- GitHub Chrome CI: 修正commit反映後の再実行待ち。
- 判定: 手動60〜80分Hard Gate、スマホQA、production QAは未成立。推測でPASSに変更しない。

