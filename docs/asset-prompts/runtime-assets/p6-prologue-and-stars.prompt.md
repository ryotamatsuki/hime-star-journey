# P6 プロローグ／湯の星アセット生成プロンプト

> 前回生成時の実行ログが残っていないため、実在画像とP6指示から復元した「再構成プロンプト」です。P6では既存画像を再生成せず、この記録を台帳として使用しました。

## 共通指定

- 手描き絵本風、水彩とガッシュ、細いインク線、子ども向け。
- 既存のひめとシロのデザインを維持する。
- 画像内に日本語文字、UI、ロゴを入れない。
- 背景は横長のゲーム画面構図。人物・小物レイヤーは単体で、鮮やかな緑のクロマキー背景。

## 背景6枚

- 対象: prologue_01_grandma_room.png ～ prologue_06_hime_decision.png
- 用途: おばあちゃんの部屋、家族旅行と道後到着、夜の道後、みかん星の核奪取、道後の異変、ひめの決意。
- 構図: 16:9でDOM会話欄を下部に重ねられる余白。人物レイヤーを左右に合成できる中央余白。
- 色: 導入はみかん色の暖色、異変は青紫、決意は暖色が戻り始める。

## 人物・小物レイヤー

- 対象: grandma_prologue_chroma.png, hime_prologue_normal_chroma.png, hime_prologue_surprised_chroma.png, shiro_prologue_fly_01_chroma.png, shiro_prologue_fly_02_chroma.png, kagemasa_minion_shadow_chroma.png, mikan_pendant_full_chroma.png, mikan_pendant_empty_chroma.png
- 用途: Canvas上で背景へ合成し、ひめの表情差分、シロの2コマ羽ばたき、影の侵入、ペンダントの明滅と核奪取を表現する。
- サイズ: 実在画像は1024×1536、1254×1254、または1448×1086。
- クロマキー: RGB約 (0, 250, 10) の鮮やかな緑。被写体の輪郭を明確にし、影や半透明光を保持する。

## 湯の星・松山城解放エフェクト

- 対象: yuno_star_chroma.png, yuno_star_glow_chroma.png, yuno_star_particles_chroma.png, yuno_star_burst_chroma.png, castle_unlock_glow_chroma.png
- 用途: 完成した一つの「湯の星」の出現、光、星粒子、バースト、星地図上の松山城解放。
- 構図: 正方形、中央発光、周囲に十分なクロマキー余白。割れた星や複数の欠片には見せない。
- クロマキー: 鮮やかな緑背景。金白、みかん色、水色の光を保持しやすい輪郭。
