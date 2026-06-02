# Asset Manifest

このファイルは、MVPで参照予定のアセットID、保存先、用途を定義する。実装側では `id` をキーに `public/assets/generated/` 以下のファイルを読み込む。

P2方針変更後の正確な生成状態は `docs/ASSET_TRACKER.md` を正とする。TitleScreen必須5件は画像生成済みで、Canvas/CSS/汎用プレースホルダーだけでは完了扱いにしない。

## 背景

| ID | ファイル | 用途 | 状態 |
|---|---|---|---|
| bg_title | `public/assets/generated/backgrounds/title_bg.png` | タイトル画面 | available |
| bg_star_map | `public/assets/generated/backgrounds/star_map_bg.png` | 星地図 | available |
| bg_dogo_explore | `public/assets/generated/backgrounds/dogo_explore_bg.png` | 道後温泉探索 | available |
| bg_castle_explore | `public/assets/generated/backgrounds/castle_explore_bg.png` | 松山城探索 | available |
| bg_dogo_battle | `public/assets/generated/backgrounds/dogo_battle_bg.png` | 道後温泉バトル | available |
| bg_castle_battle | `public/assets/generated/backgrounds/castle_battle_bg.png` | 松山城・ボスバトル | available |

## UI

| ID | ファイル | 用途 | 状態 |
|---|---|---|---|
| ui_dialogue_frame | `public/assets/generated/ui/dialogue_frame.png` | 会話フレーム参照 | available |
| ui_title_menu_frame | `public/assets/generated/ui/title_menu_frame.png` | タイトルメニュー枠 | available |
| ui_notebook_frame | `public/assets/generated/ui/notebook_frame.png` | 旅の手帳参照 | available |
| ui_card_frame | `public/assets/generated/ui/card_frame.png` | カード枠 | pending |
| ui_quest_panel_frame | `public/assets/generated/ui/quest_panel_frame.png` | クエスト表示 | pending |
| ui_star_icon_locked | `public/assets/generated/ui/star_icon_locked.png` | 未解放星 | pending |
| ui_star_icon_unlocked | `public/assets/generated/ui/star_icon_unlocked.png` | 解放済み星 | pending |
| ui_star_icon_cleared | `public/assets/generated/ui/star_icon_cleared.png` | クリア済み星 | pending |

## キャラクター

| ID | ファイル | 用途 | 状態 |
|---|---|---|---|
| hime_idle | `public/assets/generated/characters/hime_idle.png` | ひめ待機 | available |
| hime_walk_sheet | `public/assets/generated/characters/hime_walk_sheet.png` | ひめ歩行 | pending |
| hime_battle_sheet | `public/assets/generated/characters/hime_battle_sheet.png` | ひめバトル | pending |
| shiro_idle | `public/assets/generated/characters/shiro_idle.png` | シロ待機 | available |
| shiro_fly_sheet | `public/assets/generated/characters/shiro_fly_sheet.png` | シロ浮遊 | pending |

## 通常敵

| ID | ファイル | 用途 | 状態 |
|---|---|---|---|
| dogo_oni | `public/assets/generated/enemies/dogo_oni.png` | 湯どろぼう鬼 | pending |
| dogo_lantern | `public/assets/generated/enemies/dogo_lantern.png` | あお提灯 | pending |
| dogo_armor | `public/assets/generated/enemies/dogo_armor.png` | さびよろい | pending |
| dogo_mouse | `public/assets/generated/enemies/dogo_mouse.png` | ゆげネズミ | pending |
| castle_soldier | `public/assets/generated/enemies/castle_soldier.png` | 影足軽 | pending |
| castle_oni | `public/assets/generated/enemies/castle_oni.png` | 石垣鬼 | pending |
| castle_well | `public/assets/generated/enemies/castle_well.png` | くらやみ井戸 | pending |
| castle_crow | `public/assets/generated/enemies/castle_crow.png` | 黒羽ガラス | pending |

## ボス

| ID | ファイル | 用途 | 状態 |
|---|---|---|---|
| boss_kagemasa | `public/assets/generated/bosses/boss_kagemasa.png` | カゲマサ立ち絵 | pending |
| boss_kagemasa_sheet | `public/assets/generated/bosses/boss_kagemasa_sheet.png` | カゲマサアニメーション | pending |

## カード

| ID | ファイル | 用途 | 状態 |
|---|---|---|---|
| card_mikan_attack | `public/assets/generated/cards/card_mikan_attack.png` | みかん星アタック | pending |
| card_shirasagi_ofuda | `public/assets/generated/cards/card_shirasagi_ofuda.png` | 白鷺のおふだ | pending |
| card_dogo_drop | `public/assets/generated/cards/card_dogo_drop.png` | 道後の湯しずく | pending |
| card_yukemuri_veil | `public/assets/generated/cards/card_yukemuri_veil.png` | 湯けむりヴェール | pending |
| card_castle_guard | `public/assets/generated/cards/card_castle_guard.png` | 城山のまもり | pending |
| card_star_seal | `public/assets/generated/cards/card_star_seal.png` | 星封じ | pending |

## エフェクト

| ID | ファイル | 用途 | 状態 |
|---|---|---|---|
| fx_title_star_particles | `public/assets/generated/effects/title_star_particles.png` | タイトル画面の星粒子 | available |







