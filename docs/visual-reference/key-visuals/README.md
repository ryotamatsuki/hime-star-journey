# Key Visuals

`picture/` から整理したMVP計画用の主要ビジュアル参照です。

これらはフルスクリーンの参照画像です。Canvas/DOM実装時の構図、色、UI密度、余白、アセット切り出し方針の参考にします。ゲーム用スプライトとして直接使う前提ではありません。

## Files

| File | Purpose |
|---|---|
| `01_title_screen.png` | タイトル画面参照 |
| `02_dogo_exploration.png` | 道後温泉探索参照 |
| `03_matsuyama_castle_exploration.png` | 松山城探索参照 |
| `04_normal_battle_multi_enemy.png` | 複数敵通常バトル参照 |
| `05_boss_battle_kagemasa.png` | カゲマサ戦参照 |
| `06_star_map.png` | 星地図参照 |
| `07_dialogue_event.png` | 会話イベント参照 |
| `08_travel_notebook.png` | 旅の手帳参照 |

## Notes

- 生成済み背景やUI参照として使う画像は `public/assets/generated/` に配置します。
- ゲーム内スプライト、カード、UIフレームはP2以降で個別生成または切り出します。
- 画像読み込みに失敗しても、実装側はCanvas代替図形を描いてゲームを停止させない方針です。







