# P8 implementation contract

P8 starts only after `flags.p8_kagemasa_route_unlocked === true`.

Runtime flow:

1. P7 complete save exposes `天守奥へ進む` while on castle Explore/StarMap.
2. Starting P8 restores HP/MP, unlocks `card_star_seal`, and starts `enc_boss_kagemasa` as a boss battle.
3. Kagemasa cannot be defeated by HP damage alone. `sealGauge` must reach zero.
4. Battle victory records `B-E01`; `P8FlowController` then finalizes P8 atomically.
5. Finalization restores the mikan-star core, adds the castle star, restores the pendant light, sets `gameCompleted`, and moves to `EndingScreen`.
6. Ending shows the restored journey plus still-locked blank stars and lets the player return to the star map or title.

Required final state includes:

- `flags.kagemasa_sealed === true`
- `flags.mikan_core_recovered === true`
- `flags.castle_star_obtained === true`
- `flags.star_castle_collected === true`
- `flags.pendant_light_restored === true`
- `flags.p8_completed === true`
- `flags.gameCompleted === true`
- `collectedStars` includes `castle`
- `acquiredItems.mikan_star_core >= 1`
- `currentScreenId === "ending"` immediately after completion

Regression gate: `npm run p8:browser`.
