# ASSET_TRACKER

## 状態ラベル

- `generated`: Runtime Assetとして画像生成または既存生成画像を配置済み。
- `processed-transparent`: クロマキー原本を保持し、RGBA透過PNGの品質確認済み。
- `connected`: AssetManifest登録とゲーム画面への接続済み。
- `pending`: 後続フェーズで完成品質の生成・差し替えが必要。
- `not-needed-yet`: 現フェーズでは接続不要。
- `not-needed-css-implemented`: 画像アセットとしては不要。DOM/CSS実装へ置き換え済み。
- `failed`: 生成、保存、または読み込み確認で失敗。

P2方針変更後、TitleScreen必須5件はCanvas/CSS/汎用プレースホルダーでは完了扱いにしない。`title_bg`、`hime_idle`、`shiro_idle`、`title_menu_frame`、`title_star_particles` はすべて画像生成済み。

P3方針変更後、道後温泉2.5D探索マップ必須10件も画像生成必須とし、汎用プレースホルダーでは完了扱いにしない。`dogo_map_base`、`dogo_map_foreground`、`dogo_map_overlay_steam`、`hime_walk_sheet`、`shiro_fly_sheet`、`dogo_oni`、`dogo_lantern`、`dogo_armor`、`dogo_mouse`、`quest_panel_frame` はすべて画像生成済み。

P4ではStarMapScreen必須7件も画像生成必須とし、Canvas/CSS/単色矩形/汎用プレースホルダーでは完了扱いにしない。初回P4では画像生成環境が使えず `failed` としたが、2026-06-03の再実行で組み込み画像生成により7件すべてを生成・配置したため、最新状態は `generated` とする。2026-06-05のP4仕上げで、P4必須7件はAssetManifest登録、StarMapScreen参照、devサーバーHTTP 200、`dist/assets/generated/` へのコピーを確認済み。2026-06-06のP4.6で `star_icon_unlocked` と `star_map_panel_frame` はクロマキー背景を透明化し、`transparency-fixed` 相当として確認済み。

P4.5では会話枠・話者名・本文・次へボタンは画像生成せず、DOM/CSSで実装する。ポートレートとNPC画像4件のみ画像生成必須とし、`portrait_hime`、`portrait_shiro`、`npc_dogo_guide`、`npc_yumori_grandma` はすべて画像生成済み。`dialogue_frame` は画像アセットとしては不要になったため、最新状態は `not-needed-css-implemented` とする。

P5.1では `dogo_battle_bg` を道後温泉通常戦闘専用背景として画像生成し直した。旧画像は参照キービジュアルに近く、UI・キャラクター・敵・カードを含んでいたため、`public/assets/generated/_backup/p5_1/dogo_battle_bg_before_p5_1.png` に退避した。新しい背景はBattleScreenで使用済み。

## P12.1 しまなみ本番ビジュアル

P12.1ではA2-0〜A2-5の本番背景6枚、しまなみ地域敵3種、Boss、NPCを `docs/asset-prompts/p12.1/manifest.json` とsource/provenance/SHA256付きで管理し、runtimeのArea単位lazy loadingへ接続した。2026-09-03 Final Candidate QAで11 assetの実PNGそのものを表示し、背景6枚はwalkable/collision/guide path overlayを重ねて確認した。

A2-0では小舟routeのwalkableがフェリー船体へ食い込むHighを検出し、船体側walkable枝を撤去して小舟portalを岸壁側へ移動した。A2-1〜A2-5はproduction地面と主要walkable/guide/collisionのCritical/Highなし。A2-3の風車／上島portal、A2-2の星のかけら／portalもprogression interactionを奪わない配置へ分離済み。Actions #123ではvisual QA bundle upload、static/build、P7〜P12 Chrome gateを同一HEAD・同一runでPASSした。

| ID群 | 用途 | 状態 | 接続先 / 備考 |
|---|---|---|---|
| `bg_shimanami_A2_0_port_hub` ～ `bg_shimanami_A2_5_wind_lighthouse` | しまなみA2背景6枚 | generated / connected / final-candidate-reviewed | ExploreScreen、しまなみBattleScreen。実画像＋geometry overlayを確認。A2-0 High修正後、Critical/High 0。manifestのsource/runtime/SHA一致。 |
| `enemy_shimanami_wind_thief`, `enemy_shimanami_tide_crab`, `enemy_shimanami_gull` | 地域敵3種 | processed-transparent / connected / final-candidate-reviewed | 実PNGを表示してcharacter readabilityを確認。Field enemy symbol、通常Battleでcontain描画。Critical/High 0。 |
| `boss_shimanami_octopus` | しまかぜ大だこ | processed-transparent / connected / final-candidate-reviewed | 実PNGを表示してsilhouette/landmark readabilityを確認。A2-5 field、Boss battle。Critical/High 0。 |
| `npc_shimanami_keeper` | しまなみ案内NPC | processed-transparent / connected / final-candidate-reviewed | 実PNGを表示してreadabilityを確認。A2 NPC。Critical/High 0。現状は同一assetを各Subareaで使用。 |

P12.1 production visual candidateの **Critical 0 / High 0**。ただしこれはFinal P12 asset completionではない。60〜80分人手Hard Gate、iOS/Android実機相当Final QA、merge後GitHub Pagesのproduction load/404/console/performance QAは未実施のため、PR #16はmergeせず **READY FOR MANUAL HARD GATE** で停止する。

## P6 プロローグ・湯の星

| ファイル群 | 用途 | 状態 | 接続先 |
|---|---|---|---|
| `prologue_01_*.png` ～ `prologue_06_*.png` | プロローグ背景6枚 | generated / connected / runtime-verified | PrologueScreen |
| `grandma_prologue.png`, `hime_prologue_*.png` | 祖母・ひめ透過レイヤー | processed-transparent / connected / runtime-verified | PrologueScreen |
| `shiro_prologue_fly_*.png` | シロ2コマ羽ばたき | processed-transparent / connected | PrologueScreen |
| `kagemasa_minion_shadow.png` | 黒い手下の影 | processed-transparent / connected | PrologueScreen |
| `mikan_pendant_*.png` | 発光中／核奪取後ペンダント | processed-transparent / connected | PrologueScreen |
| `yuno_star*.png` | 完成した湯の星、発光、粒子、バースト | processed-transparent / connected / runtime-verified | ExploreScreen |
| `castle_unlock_glow.png` | 松山城解放光 | processed-transparent / connected / runtime-verified | StarMapScreen |

クロマキー原本 `*_chroma.png` は再処理用に保持。13件すべてRGBA、四隅alpha 0、透明画素・不透明被写体ありを `npm run assets:p6:verify` で確認済み。2026-06-25のEdge CDP補助確認で、プロローグ背景、祖母レイヤー、ひめレイヤー、湯の星、松山城解放光の代表URLがHTTP 200で読み込めることを確認した。

## 背景

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| bg_title | `public/assets/generated/backgrounds/title_bg.png` | タイトル画面 | generated | P2方針変更で再生成し、TitleScreenに接続 |
| bg_star_map | `public/assets/generated/backgrounds/star_map_bg.png` | 星地図 | generated | P4再実行で画像生成し、StarMapScreen背景に接続。P4仕上げでHTTP 200とdistコピー確認済み |
| bg_dogo_explore | `public/assets/generated/backgrounds/dogo_explore_bg.png` | 道後温泉探索 | generated | P3 ExploreScreenで使用 |
| bg_dogo_map_base | `public/assets/generated/backgrounds/dogo_map_base.png` | 道後温泉2.5D探索ベースマップ | generated | P3方針変更で生成し、ExploreScreenに接続 |
| bg_dogo_map_foreground | `public/assets/generated/backgrounds/dogo_map_foreground.png` | 道後温泉2.5D前景レイヤー | generated | P3方針変更で生成し、ExploreScreenに接続 |
| bg_dogo_map_overlay_steam | `public/assets/generated/backgrounds/dogo_map_overlay_steam.png` | 道後温泉湯けむりオーバーレイ | generated | P3方針変更で生成し、Canvas上で透明度・ドリフトを付与 |
| bg_castle_explore | `public/assets/generated/backgrounds/castle_explore_bg.png` | 松山城探索 | generated / connected | P7松山城C0探索背景として接続 |
| bg_dogo_battle | `public/assets/generated/backgrounds/dogo_battle_bg.png` | 道後温泉通常戦闘 | generated | P5.1で戦闘専用背景として再生成し、BattleScreenに接続。旧画像は `_backup/p5_1/` に退避 |
| bg_castle_battle | `public/assets/generated/backgrounds/castle_battle_bg.png` | 松山城・ボスバトル | generated | 後続フェーズ接続用 |

## キャラクター

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| hime_idle | `public/assets/generated/characters/hime_idle.png` | ひめ待機 | generated | P2方針変更で再生成し、TitleScreen/P3 Playerで使用 |
| portrait_hime | `public/assets/generated/characters/portrait_hime.png` | ひめ会話ポートレート | generated | P4.5で画像生成し、DialogueBoxで使用 |
| hime_walk_sheet | `public/assets/generated/characters/hime_walk_sheet.png` | ひめ歩行 | generated | P3方針変更で4方向x4フレーム相当を画像生成し、Playerに接続 |
| hime_battle_sheet | `public/assets/generated/characters/hime_battle_sheet.png` | ひめバトル | pending | 既存画像はラフな仮素材。P5.1 BattleScreenは `hime_idle` を使用。完成品質のバトルシート制作は後続 |
| shiro_idle | `public/assets/generated/characters/shiro_idle.png` | シロ待機 | generated | P2方針変更で再生成し、TitleScreen/P3 Companionで使用 |
| portrait_shiro | `public/assets/generated/characters/portrait_shiro.png` | シロ会話ポートレート | generated | P4.5で画像生成し、DialogueBoxで使用 |
| shiro_fly_sheet | `public/assets/generated/characters/shiro_fly_sheet.png` | シロ浮遊 | generated | P3方針変更で横4フレーム相当を画像生成し、Companionに接続 |
| npc_dogo_guide | `public/assets/generated/characters/npc_dogo_guide.png` | 道後温泉の案内人NPC | generated | P4.5で画像生成し、NPC表示とDialogueBoxで使用 |
| npc_yumori_grandma | `public/assets/generated/characters/npc_yumori_grandma.png` | 湯守のおばあさんNPC | generated | P4.5で画像生成し、NPC表示とDialogueBoxで使用 |

## 通常敵

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| enemy_dogo_oni | `public/assets/generated/enemies/dogo_oni.png` | 湯どろぼう鬼 | generated | P3方針変更で画像生成し、wanderアニメーション付きで接続 |
| enemy_dogo_lantern | `public/assets/generated/enemies/dogo_lantern.png` | あお提灯 | generated | P3方針変更で画像生成し、blink / floatingアニメーション付きで接続 |
| enemy_dogo_armor | `public/assets/generated/enemies/dogo_armor.png` | さびよろい | generated | P3方針変更で画像生成し、shakeアニメーション付きで接続 |
| enemy_dogo_mouse | `public/assets/generated/enemies/dogo_mouse.png` | ゆげネズミ | generated | P3方針変更で画像生成し、scurryアニメーション付きで接続 |
| enemy_castle_soldier | `public/assets/generated/enemies/castle_soldier.png` | 影足軽 | generated / connected | P7松山城C0の敵シンボルC-E01/C-E05とEncounterDataに接続 |
| enemy_castle_oni | `public/assets/generated/enemies/castle_oni.png` | 石垣鬼 | generated / connected | P7松山城C0の敵シンボルC-E02とEncounterDataに接続 |
| enemy_castle_well | `public/assets/generated/enemies/castle_well.png` | くらやみ井戸 | generated / connected | P7松山城C0の敵シンボルC-E04とEncounterDataに接続 |
| enemy_castle_crow | `public/assets/generated/enemies/castle_crow.png` | 黒羽ガラス | generated / connected | P7松山城C0の敵シンボルC-E03とEncounterDataに接続 |

## ボス

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| boss_kagemasa | `public/assets/generated/bosses/boss_kagemasa.png` | カゲマサ立ち絵 | generated | P2で画像生成 |
| boss_kagemasa_sheet | `public/assets/generated/bosses/boss_kagemasa_sheet.png` | カゲマサアニメーション | pending | 完成品質シートは後続 |

## カード

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| card_mikan_attack | `public/assets/generated/cards/card_mikan_attack.png` | みかん星アタック | pending | P5.1 BattleScreenのカードUIと効果に接続済み。カード名・説明・MPはDOM実テキスト表示。完成品質カードアイコンは後続 |
| card_shirasagi_ofuda | `public/assets/generated/cards/card_shirasagi_ofuda.png` | 白鷺のおふだ | pending | P5.1 BattleScreenのカードUIと効果に接続済み。カード名・説明・MPはDOM実テキスト表示。完成品質カードアイコンは後続 |
| card_dogo_drop | `public/assets/generated/cards/card_dogo_drop.png` | 道後の湯しずく | pending | P5.1 BattleScreenのカードUIと効果に接続済み。カード名・説明・MPはDOM実テキスト表示。完成品質カードアイコンは後続 |
| card_yukemuri_veil | `public/assets/generated/cards/card_yukemuri_veil.png` | 湯けむりヴェール | pending | P5.1 BattleScreenのカードUIと効果に接続済み。カード名・説明・MPはDOM実テキスト表示。完成品質カードアイコンは後続 |
| card_castle_guard | `public/assets/generated/cards/card_castle_guard.png` | 城山のまもり | generated / connected | P7の取得イベント、保存フラグ、BattleScreenカード効果に接続。完成品質カードアイコン調整は後続 |
| card_star_seal | `public/assets/generated/cards/card_star_seal.png` | 星封じ | pending | P5.1 BattleScreenのカードUIと効果に接続済み。進行解放と完成品質カードアイコンは後続 |

## UI

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| ui_title_menu_frame | `public/assets/generated/ui/title_menu_frame.png` | タイトルメニュー枠 | generated | P2方針変更で画像生成し、TitleScreenに接続 |
| dialogue_frame | なし | 会話フレーム | not-needed-css-implemented | P4.5でDOM/CSSのDialogueBoxへ置き換え。会話テキストは実テキスト表示、画像生成しない |
| ui_card_frame | `public/assets/generated/ui/card_frame.png` | カード枠 | generated | P2で画像生成。P5.1でBattleScreenのDOMカード背景として接続 |
| ui_notebook_frame | `public/assets/generated/ui/notebook_frame.png` | 旅の手帳 | generated | 既存生成物をP2で登録 |
| ui_quest_panel_frame | `public/assets/generated/ui/quest_panel_frame.png` | クエスト表示 | generated | P3方針変更で画像生成し、QuestPanel背景に接続 |
| ui_star_icon_locked | `public/assets/generated/ui/star_icon_locked.png` | 未解放星 | generated | P4再実行で画像生成し、StarMapScreenのlockedノードに接続。P4仕上げでHTTP 200とdistコピー確認済み |
| ui_star_icon_unlocked | `public/assets/generated/ui/star_icon_unlocked.png` | 解放済み星 | generated | P4再実行で画像生成し、StarMapScreenのunlocked/inProgressノードに接続。P4.6で緑クロマキー背景を透明化し、`transparency-fixed` 相当として星地図背景上の合成プレビュー確認済み |
| ui_star_icon_cleared | `public/assets/generated/ui/star_icon_cleared.png` | クリア済み星 | generated | P4再実行で画像生成し、StarMapScreenのclearedノードに接続。P4仕上げでHTTP 200とdistコピー確認済み |
| ui_star_map_panel_frame | `public/assets/generated/ui/star_map_panel_frame.png` | 星地図パネル枠 | generated | P4再実行で画像生成し、StarMapScreenのDOMパネル背景に接続。P4.6でマゼンタクロマキー背景を透明化し、`transparency-fixed` 相当として星地図背景上の合成プレビュー確認済み |
| ui_location_badge_dogo | `public/assets/generated/ui/location_badge_dogo.png` | 道後温泉ノード補助バッジ | generated | P4再実行で画像生成し、道後温泉ノードに接続。P4仕上げでHTTP 200とdistコピー確認済み |
| ui_location_badge_castle | `public/assets/generated/ui/location_badge_castle.png` | 松山城ノード補助バッジ | generated | P4再実行で画像生成し、松山城ノードに接続。P4仕上げでHTTP 200とdistコピー確認済み |

## エフェクト

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| fx_title_star_particles | `public/assets/generated/effects/title_star_particles.png` | タイトル星粒子 | generated | P2方針変更で画像生成し、TitleScreenに接続 |
| fx_star_hit | `public/assets/generated/effects/fx_star_hit.png` | 星攻撃 | pending | Canvasエフェクト関数も併用。完成品質化は後続 |
| fx_yukemuri_heal | `public/assets/generated/effects/fx_yukemuri_heal.png` | 湯けむり回復 | pending | Canvasエフェクト関数も併用。完成品質化は後続 |
| fx_shirasagi_light | `public/assets/generated/effects/fx_shirasagi_light.png` | 白鷺光 | pending | Canvasエフェクト関数も併用。完成品質化は後続 |
| fx_seal_light | `public/assets/generated/effects/fx_seal_light.png` | 星封じ | pending | Canvasエフェクト関数も併用。完成品質化は後続 |

## 共通代替画像

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| placeholder_background | `public/assets/generated/placeholders/placeholder_background.png` | 背景代替 | not-needed-yet | AssetLoader fallback用。P2必須5件の完了判定には使わない |
| placeholder_character | `public/assets/generated/placeholders/placeholder_character.png` | キャラ代替 | not-needed-yet | AssetLoader fallback用。P2必須5件の完了判定には使わない |
| placeholder_enemy | `public/assets/generated/placeholders/placeholder_enemy.png` | 敵代替 | not-needed-yet | AssetLoader fallback用 |
| placeholder_card | `public/assets/generated/placeholders/placeholder_card.png` | カード代替 | not-needed-yet | AssetLoader fallback用 |
| placeholder_ui_frame | `public/assets/generated/placeholders/placeholder_ui_frame.png` | UI代替 | not-needed-yet | AssetLoader fallback用。P2必須5件の完了判定には使わない |

## 参照画像

主要ビジュアル8枚は `docs/visual-reference/key-visuals/` に整理済み。これらは構図、色、UI密度の参照であり、Runtime Assetとして直接使用しない。P2方針変更後も上書きしていない。
