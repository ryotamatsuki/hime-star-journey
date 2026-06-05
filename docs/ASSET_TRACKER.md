# ASSET_TRACKER

## 状態ラベル

- `generated`: Runtime Assetとして画像生成または既存生成画像を配置済み。
- `pending`: 後続フェーズで完成品質の生成・差し替えが必要。
- `not-needed-yet`: 現フェーズでは接続不要。
- `failed`: 生成、保存、または読み込み確認で失敗。

P2方針変更後、TitleScreen必須5件はCanvas/CSS/汎用プレースホルダーでは完了扱いにしない。`title_bg`、`hime_idle`、`shiro_idle`、`title_menu_frame`、`title_star_particles` はすべて画像生成済み。

P3方針変更後、道後温泉2.5D探索マップ必須10件も画像生成必須とし、汎用プレースホルダーでは完了扱いにしない。`dogo_map_base`、`dogo_map_foreground`、`dogo_map_overlay_steam`、`hime_walk_sheet`、`shiro_fly_sheet`、`dogo_oni`、`dogo_lantern`、`dogo_armor`、`dogo_mouse`、`quest_panel_frame` はすべて画像生成済み。

P4ではStarMapScreen必須7件も画像生成必須とし、Canvas/CSS/単色矩形/汎用プレースホルダーでは完了扱いにしない。初回P4では画像生成環境が使えず `failed` としたが、2026-06-03の再実行で組み込み画像生成により7件すべてを生成・配置したため、最新状態は `generated` とする。2026-06-05のP4仕上げで、P4必須7件はAssetManifest登録、StarMapScreen参照、devサーバーHTTP 200、`dist/assets/generated/` へのコピーを確認済み。

## 背景

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| bg_title | `public/assets/generated/backgrounds/title_bg.png` | タイトル画面 | generated | P2方針変更で再生成し、TitleScreenに接続 |
| bg_star_map | `public/assets/generated/backgrounds/star_map_bg.png` | 星地図 | generated | P4再実行で画像生成し、StarMapScreen背景に接続。P4仕上げでHTTP 200とdistコピー確認済み |
| bg_dogo_explore | `public/assets/generated/backgrounds/dogo_explore_bg.png` | 道後温泉探索 | generated | P3 ExploreScreenで使用 |
| bg_dogo_map_base | `public/assets/generated/backgrounds/dogo_map_base.png` | 道後温泉2.5D探索ベースマップ | generated | P3方針変更で生成し、ExploreScreenに接続 |
| bg_dogo_map_foreground | `public/assets/generated/backgrounds/dogo_map_foreground.png` | 道後温泉2.5D前景レイヤー | generated | P3方針変更で生成し、ExploreScreenに接続 |
| bg_dogo_map_overlay_steam | `public/assets/generated/backgrounds/dogo_map_overlay_steam.png` | 道後温泉湯けむりオーバーレイ | generated | P3方針変更で生成し、Canvas上で透明度・ドリフトを付与 |
| bg_castle_explore | `public/assets/generated/backgrounds/castle_explore_bg.png` | 松山城探索 | generated | 後続フェーズ接続用 |
| bg_dogo_battle | `public/assets/generated/backgrounds/dogo_battle_bg.png` | 道後温泉バトル | generated | 後続フェーズ接続用 |
| bg_castle_battle | `public/assets/generated/backgrounds/castle_battle_bg.png` | 松山城・ボスバトル | generated | 後続フェーズ接続用 |

## キャラクター

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| hime_idle | `public/assets/generated/characters/hime_idle.png` | ひめ待機 | generated | P2方針変更で再生成し、TitleScreen/P3 Playerで使用 |
| hime_walk_sheet | `public/assets/generated/characters/hime_walk_sheet.png` | ひめ歩行 | generated | P3方針変更で4方向x4フレーム相当を画像生成し、Playerに接続 |
| hime_battle_sheet | `public/assets/generated/characters/hime_battle_sheet.png` | ひめバトル | pending | 完成品質のバトルシート制作は後続 |
| shiro_idle | `public/assets/generated/characters/shiro_idle.png` | シロ待機 | generated | P2方針変更で再生成し、TitleScreen/P3 Companionで使用 |
| shiro_fly_sheet | `public/assets/generated/characters/shiro_fly_sheet.png` | シロ浮遊 | generated | P3方針変更で横4フレーム相当を画像生成し、Companionに接続 |

## 通常敵

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| enemy_dogo_oni | `public/assets/generated/enemies/dogo_oni.png` | 湯どろぼう鬼 | generated | P3方針変更で画像生成し、wanderアニメーション付きで接続 |
| enemy_dogo_lantern | `public/assets/generated/enemies/dogo_lantern.png` | あお提灯 | generated | P3方針変更で画像生成し、blink / floatingアニメーション付きで接続 |
| enemy_dogo_armor | `public/assets/generated/enemies/dogo_armor.png` | さびよろい | generated | P3方針変更で画像生成し、shakeアニメーション付きで接続 |
| enemy_dogo_mouse | `public/assets/generated/enemies/dogo_mouse.png` | ゆげネズミ | generated | P3方針変更で画像生成し、scurryアニメーション付きで接続 |
| enemy_castle_soldier | `public/assets/generated/enemies/castle_soldier.png` | 影足軽 | pending | 完成品質化は後続 |
| enemy_castle_oni | `public/assets/generated/enemies/castle_oni.png` | 石垣鬼 | pending | 完成品質化は後続 |
| enemy_castle_well | `public/assets/generated/enemies/castle_well.png` | くらやみ井戸 | pending | 完成品質化は後続 |
| enemy_castle_crow | `public/assets/generated/enemies/castle_crow.png` | 黒羽ガラス | pending | 完成品質化は後続 |

## ボス

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| boss_kagemasa | `public/assets/generated/bosses/boss_kagemasa.png` | カゲマサ立ち絵 | generated | P2で画像生成 |
| boss_kagemasa_sheet | `public/assets/generated/bosses/boss_kagemasa_sheet.png` | カゲマサアニメーション | pending | 完成品質シートは後続 |

## カード

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| card_mikan_attack | `public/assets/generated/cards/card_mikan_attack.png` | みかん星アタック | pending | 完成品質カードアイコンは後続 |
| card_shirasagi_ofuda | `public/assets/generated/cards/card_shirasagi_ofuda.png` | 白鷺のおふだ | pending | 完成品質カードアイコンは後続 |
| card_dogo_drop | `public/assets/generated/cards/card_dogo_drop.png` | 道後の湯しずく | pending | 完成品質カードアイコンは後続 |
| card_yukemuri_veil | `public/assets/generated/cards/card_yukemuri_veil.png` | 湯けむりヴェール | pending | 完成品質カードアイコンは後続 |
| card_castle_guard | `public/assets/generated/cards/card_castle_guard.png` | 城山のまもり | pending | 完成品質カードアイコンは後続 |
| card_star_seal | `public/assets/generated/cards/card_star_seal.png` | 星封じ | pending | 完成品質カードアイコンは後続 |

## UI

| ID | ファイル | 用途 | 状態 | 備考 |
|---|---|---|---|---|
| ui_title_menu_frame | `public/assets/generated/ui/title_menu_frame.png` | タイトルメニュー枠 | generated | P2方針変更で画像生成し、TitleScreenに接続 |
| ui_dialogue_frame | `public/assets/generated/ui/dialogue_frame.png` | 会話フレーム | generated | P3の会話/メッセージ参照 |
| ui_card_frame | `public/assets/generated/ui/card_frame.png` | カード枠 | generated | P2で画像生成 |
| ui_notebook_frame | `public/assets/generated/ui/notebook_frame.png` | 旅の手帳 | generated | 既存生成物をP2で登録 |
| ui_quest_panel_frame | `public/assets/generated/ui/quest_panel_frame.png` | クエスト表示 | generated | P3方針変更で画像生成し、QuestPanel背景に接続 |
| ui_star_icon_locked | `public/assets/generated/ui/star_icon_locked.png` | 未解放星 | generated | P4再実行で画像生成し、StarMapScreenのlockedノードに接続。P4仕上げでHTTP 200とdistコピー確認済み |
| ui_star_icon_unlocked | `public/assets/generated/ui/star_icon_unlocked.png` | 解放済み星 | generated | P4再実行で画像生成し、StarMapScreenのunlocked/inProgressノードに接続。透過細部調整は後回し。P4仕上げでHTTP 200とdistコピー確認済み |
| ui_star_icon_cleared | `public/assets/generated/ui/star_icon_cleared.png` | クリア済み星 | generated | P4再実行で画像生成し、StarMapScreenのclearedノードに接続。P4仕上げでHTTP 200とdistコピー確認済み |
| ui_star_map_panel_frame | `public/assets/generated/ui/star_map_panel_frame.png` | 星地図パネル枠 | generated | P4再実行で画像生成し、StarMapScreenのDOMパネル背景に接続。透過細部調整は後回し。P4仕上げでHTTP 200とdistコピー確認済み |
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


