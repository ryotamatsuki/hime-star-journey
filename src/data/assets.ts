import type { AssetManifest, ImageAssetDefinition } from "../types/assets";

const imageAssets: ImageAssetDefinition[] = [
  {
    id: "placeholder_background",
    src: "/assets/generated/placeholders/placeholder_background.png",
    description: "Generic background placeholder"
  },
  {
    id: "placeholder_character",
    src: "/assets/generated/placeholders/placeholder_character.png",
    description: "Generic character placeholder"
  },
  {
    id: "placeholder_enemy",
    src: "/assets/generated/placeholders/placeholder_enemy.png",
    description: "Generic enemy placeholder"
  },
  {
    id: "placeholder_card",
    src: "/assets/generated/placeholders/placeholder_card.png",
    description: "Generic card placeholder"
  },
  {
    id: "placeholder_ui_frame",
    src: "/assets/generated/placeholders/placeholder_ui_frame.png",
    description: "Generic UI frame placeholder"
  },
  {
    id: "bg_title",
    src: "/assets/generated/backgrounds/title_bg.png",
    required: true,
    description: "Phase 2 generated title background"
  },
  {
    id: "bg_dogo_map_base",
    src: "/assets/generated/backgrounds/dogo_map_base.png",
    required: true,
    description: "Phase 3 generated Dogo 2.5D base map"
  },
  {
    id: "bg_dogo_map_foreground",
    src: "/assets/generated/backgrounds/dogo_map_foreground.png",
    required: true,
    description: "Phase 3 generated Dogo foreground layer"
  },
  {
    id: "bg_dogo_map_overlay_steam",
    src: "/assets/generated/backgrounds/dogo_map_overlay_steam.png",
    required: true,
    description: "Phase 3 generated Dogo steam overlay layer"
  },
  {
    id: "bg_star_map",
    src: "/assets/generated/backgrounds/star_map_bg.png",
    required: true,
    fallbackAssetId: "placeholder_background",
    description: "Phase 4 generated star map background"
  },
  {
    id: "bg_dogo_explore",
    src: "/assets/generated/backgrounds/dogo_explore_bg.png",
    fallbackAssetId: "placeholder_background",
    description: "Legacy Dogo exploration background"
  },
  {
    id: "bg_castle_explore",
    src: "/assets/generated/backgrounds/castle_explore_bg.png",
    fallbackAssetId: "placeholder_background",
    description: "Future Matsuyama Castle exploration background"
  },
  {
    id: "bg_dogo_battle",
    src: "/assets/generated/backgrounds/dogo_battle_bg.png",
    fallbackAssetId: "placeholder_background",
    description: "Phase 5.1 generated Dogo normal battle background"
  },
  {
    id: "bg_castle_battle",
    src: "/assets/generated/backgrounds/castle_battle_bg.png",
    fallbackAssetId: "placeholder_background",
    description: "Future Matsuyama Castle battle background"
  },
  {
    id: "hime_idle",
    src: "/assets/generated/characters/hime_idle.png",
    required: true,
    description: "Phase 2 generated Hime idle art"
  },
  {
    id: "portrait_hime",
    src: "/assets/generated/characters/portrait_hime.png",
    required: true,
    description: "Phase 4.5 generated Hime dialogue portrait"
  },
  {
    id: "hime_walk_sheet",
    src: "/assets/generated/characters/hime_walk_sheet.png",
    required: true,
    description: "Phase 3 generated Hime walking sheet"
  },
  {
    id: "hime_battle_sheet",
    src: "/assets/generated/characters/hime_battle_sheet.png",
    fallbackAssetId: "placeholder_character",
    description: "Future Hime battle sheet"
  },
  {
    id: "shiro_idle",
    src: "/assets/generated/characters/shiro_idle.png",
    required: true,
    description: "Phase 2 generated Shiro idle art"
  },
  {
    id: "portrait_shiro",
    src: "/assets/generated/characters/portrait_shiro.png",
    required: true,
    description: "Phase 4.5 generated Shiro dialogue portrait"
  },
  {
    id: "shiro_fly_sheet",
    src: "/assets/generated/characters/shiro_fly_sheet.png",
    required: true,
    description: "Phase 3 generated Shiro fly sheet"
  },
  {
    id: "npc_dogo_guide",
    src: "/assets/generated/characters/npc_dogo_guide.png",
    required: true,
    description: "Phase 4.5 generated Dogo guide NPC"
  },
  {
    id: "npc_yumori_grandma",
    src: "/assets/generated/characters/npc_yumori_grandma.png",
    required: true,
    description: "Phase 4.5 generated Yumori grandma NPC"
  },
  {
    id: "enemy_dogo_oni",
    src: "/assets/generated/enemies/dogo_oni.png",
    required: true,
    description: "Phase 3 generated Dogo oni enemy symbol"
  },
  {
    id: "enemy_dogo_lantern",
    src: "/assets/generated/enemies/dogo_lantern.png",
    required: true,
    description: "Phase 3 generated Dogo lantern enemy symbol"
  },
  {
    id: "enemy_dogo_armor",
    src: "/assets/generated/enemies/dogo_armor.png",
    required: true,
    description: "Phase 3 generated Dogo armor enemy symbol"
  },
  {
    id: "enemy_dogo_mouse",
    src: "/assets/generated/enemies/dogo_mouse.png",
    required: true,
    description: "Phase 3 generated Dogo mouse enemy symbol"
  },
  {
    id: "enemy_castle_soldier",
    src: "/assets/generated/enemies/castle_soldier.png",
    fallbackAssetId: "placeholder_enemy",
    description: "Future castle soldier enemy symbol"
  },
  {
    id: "enemy_castle_oni",
    src: "/assets/generated/enemies/castle_oni.png",
    fallbackAssetId: "placeholder_enemy",
    description: "Future castle oni enemy symbol"
  },
  {
    id: "enemy_castle_well",
    src: "/assets/generated/enemies/castle_well.png",
    fallbackAssetId: "placeholder_enemy",
    description: "Future castle well enemy symbol"
  },
  {
    id: "enemy_castle_crow",
    src: "/assets/generated/enemies/castle_crow.png",
    fallbackAssetId: "placeholder_enemy",
    description: "Future castle crow enemy symbol"
  },
  {
    id: "boss_kagemasa",
    src: "/assets/generated/bosses/boss_kagemasa.png",
    fallbackAssetId: "placeholder_enemy",
    description: "Future Kagemasa boss art"
  },
  {
    id: "boss_kagemasa_sheet",
    src: "/assets/generated/bosses/boss_kagemasa_sheet.png",
    fallbackAssetId: "placeholder_enemy",
    description: "Future Kagemasa boss sheet"
  },
  {
    id: "card_mikan_attack",
    src: "/assets/generated/cards/card_mikan_attack.png",
    fallbackAssetId: "placeholder_card",
    description: "Future mikan attack card"
  },
  {
    id: "card_shirasagi_ofuda",
    src: "/assets/generated/cards/card_shirasagi_ofuda.png",
    fallbackAssetId: "placeholder_card",
    description: "Future shirasagi ofuda card"
  },
  {
    id: "card_dogo_drop",
    src: "/assets/generated/cards/card_dogo_drop.png",
    fallbackAssetId: "placeholder_card",
    description: "Future Dogo drop card"
  },
  {
    id: "card_yukemuri_veil",
    src: "/assets/generated/cards/card_yukemuri_veil.png",
    fallbackAssetId: "placeholder_card",
    description: "Future steam veil card"
  },
  {
    id: "card_castle_guard",
    src: "/assets/generated/cards/card_castle_guard.png",
    fallbackAssetId: "placeholder_card",
    description: "Future castle guard card"
  },
  {
    id: "card_star_seal",
    src: "/assets/generated/cards/card_star_seal.png",
    fallbackAssetId: "placeholder_card",
    description: "Future star seal card"
  },
  {
    id: "ui_title_menu_frame",
    src: "/assets/generated/ui/title_menu_frame.png",
    required: true,
    description: "Phase 2 generated title menu frame"
  },
  {
    id: "ui_card_frame",
    src: "/assets/generated/ui/card_frame.png",
    fallbackAssetId: "placeholder_ui_frame",
    description: "Card frame"
  },
  {
    id: "ui_notebook_frame",
    src: "/assets/generated/ui/notebook_frame.png",
    fallbackAssetId: "placeholder_ui_frame",
    description: "Notebook frame"
  },
  {
    id: "ui_quest_panel_frame",
    src: "/assets/generated/ui/quest_panel_frame.png",
    required: true,
    description: "Phase 3 generated quest panel frame"
  },
  {
    id: "ui_star_icon_locked",
    src: "/assets/generated/ui/star_icon_locked.png",
    required: true,
    fallbackAssetId: "placeholder_ui_frame",
    description: "Phase 4 generated locked star icon"
  },
  {
    id: "ui_star_icon_unlocked",
    src: "/assets/generated/ui/star_icon_unlocked.png",
    required: true,
    fallbackAssetId: "placeholder_ui_frame",
    description: "Phase 4 generated unlocked star icon"
  },
  {
    id: "ui_star_icon_cleared",
    src: "/assets/generated/ui/star_icon_cleared.png",
    required: true,
    fallbackAssetId: "placeholder_ui_frame",
    description: "Phase 4 generated cleared star icon"
  },
  {
    id: "ui_star_map_panel_frame",
    src: "/assets/generated/ui/star_map_panel_frame.png",
    required: true,
    fallbackAssetId: "placeholder_ui_frame",
    description: "Phase 4 generated star map panel frame"
  },
  {
    id: "ui_location_badge_dogo",
    src: "/assets/generated/ui/location_badge_dogo.png",
    required: true,
    fallbackAssetId: "placeholder_ui_frame",
    description: "Phase 4 generated Dogo location badge"
  },
  {
    id: "ui_location_badge_castle",
    src: "/assets/generated/ui/location_badge_castle.png",
    required: true,
    fallbackAssetId: "placeholder_ui_frame",
    description: "Phase 4 generated Matsuyama Castle location badge"
  },
  {
    id: "fx_star_hit",
    src: "/assets/generated/effects/fx_star_hit.png",
    description: "Future star hit effect"
  },
  { id: "prologue_grandma_room", src: "/assets/generated/prologue/prologue_01_grandma_room.png", required: true, description: "P6 grandma room" },
  { id: "prologue_family_trip_dogo", src: "/assets/generated/prologue/prologue_02_family_trip_dogo.png", required: true, description: "P6 family trip" },
  { id: "prologue_dogo_night", src: "/assets/generated/prologue/prologue_03_dogo_night.png", required: true, description: "P6 Dogo night" },
  { id: "prologue_core_stolen", src: "/assets/generated/prologue/prologue_04_core_stolen.png", required: true, description: "P6 core stolen" },
  { id: "prologue_dogo_anomaly", src: "/assets/generated/prologue/prologue_05_dogo_anomaly.png", required: true, description: "P6 Dogo anomaly" },
  { id: "prologue_hime_decision", src: "/assets/generated/prologue/prologue_06_hime_decision.png", required: true, description: "P6 Hime decision" },
  { id: "prologue_grandma", src: "/assets/generated/prologue/grandma_prologue.png", required: true, description: "P6 grandma layer" },
  { id: "prologue_hime_normal", src: "/assets/generated/prologue/hime_prologue_normal.png", required: true, description: "P6 Hime layer" },
  { id: "prologue_hime_surprised", src: "/assets/generated/prologue/hime_prologue_surprised.png", required: true, description: "P6 surprised Hime layer" },
  { id: "prologue_shiro_fly_01", src: "/assets/generated/prologue/shiro_prologue_fly_01.png", required: true, description: "P6 Shiro wing frame 1" },
  { id: "prologue_shiro_fly_02", src: "/assets/generated/prologue/shiro_prologue_fly_02.png", required: true, description: "P6 Shiro wing frame 2" },
  { id: "prologue_minion_shadow", src: "/assets/generated/prologue/kagemasa_minion_shadow.png", required: true, description: "P6 shadow minion" },
  { id: "prologue_pendant_full", src: "/assets/generated/prologue/mikan_pendant_full.png", required: true, description: "P6 glowing pendant" },
  { id: "prologue_pendant_empty", src: "/assets/generated/prologue/mikan_pendant_empty.png", required: true, description: "P6 empty pendant frame" },
  { id: "fx_yuno_star", src: "/assets/generated/effects/yuno_star.png", required: true, description: "P6 complete Yuno Star" },
  { id: "fx_yuno_star_glow", src: "/assets/generated/effects/yuno_star_glow.png", required: true, description: "P6 Yuno Star glow" },
  { id: "fx_yuno_star_particles", src: "/assets/generated/effects/yuno_star_particles.png", required: true, description: "P6 Yuno Star particles" },
  { id: "fx_yuno_star_burst", src: "/assets/generated/effects/yuno_star_burst.png", required: true, description: "P6 Yuno Star burst" },
  { id: "fx_castle_unlock_glow", src: "/assets/generated/effects/castle_unlock_glow.png", required: true, description: "P6 castle unlock glow" },
  {
    id: "fx_title_star_particles",
    src: "/assets/generated/effects/title_star_particles.png",
    required: true,
    description: "Phase 2 generated title star particle sheet"
  },
  {
    id: "fx_yukemuri_heal",
    src: "/assets/generated/effects/fx_yukemuri_heal.png",
    description: "Future heal mist effect"
  },
  {
    id: "fx_shirasagi_light",
    src: "/assets/generated/effects/fx_shirasagi_light.png",
    description: "Future shirasagi light effect"
  },
  {
    id: "fx_seal_light",
    src: "/assets/generated/effects/fx_seal_light.png",
    description: "Future seal light effect"
  },
  {
    id: "bg_shimanami_A2_0_port_hub",
    src: "/assets/generated/backgrounds/shimanami_A2_0_port_hub.png",
    required: true,
    description: "P12.1 production Imabari Port Hub background"
  },
  {
    id: "bg_shimanami_A2_1_bridge_route",
    src: "/assets/generated/backgrounds/shimanami_A2_1_bridge_route.png",
    required: true,
    description: "P12.1 production Kurushima bridge route background"
  },
  {
    id: "bg_shimanami_A2_2_island_village",
    src: "/assets/generated/backgrounds/shimanami_A2_2_island_village.png",
    required: true,
    description: "P12.1 production Setouchi island village background"
  },
  {
    id: "bg_shimanami_A2_3_watchtower",
    src: "/assets/generated/backgrounds/shimanami_A2_3_watchtower.png",
    required: true,
    description: "P12.1 production Murakami sea watchtower background"
  },
  {
    id: "bg_shimanami_A2_4_kamijima_path",
    src: "/assets/generated/backgrounds/shimanami_A2_4_kamijima_path.png",
    required: true,
    description: "P12.1 production Kamijima island path background"
  },
  {
    id: "bg_shimanami_A2_5_wind_lighthouse",
    src: "/assets/generated/backgrounds/shimanami_A2_5_wind_lighthouse.png",
    required: true,
    description: "P12.1 production wind lighthouse boss-space background"
  },
  {
    id: "enemy_shimanami_wind_thief",
    src: "/assets/generated/enemies/shimanami_wind_thief.png",
    required: true,
    description: "P12.1 generated regional enemy: wind thief"
  },
  {
    id: "enemy_shimanami_tide_crab",
    src: "/assets/generated/enemies/shimanami_tide_crab.png",
    required: true,
    description: "P12.1 generated regional enemy: tide crab"
  },
  {
    id: "enemy_shimanami_gull",
    src: "/assets/generated/enemies/shimanami_gull.png",
    required: true,
    description: "P12.1 generated regional enemy: black-wing gull"
  },
  {
    id: "boss_shimanami_octopus",
    src: "/assets/generated/bosses/shimanami_wind_octopus.png",
    required: true,
    description: "P12.1 generated regional boss: wind octopus"
  },
  {
    id: "npc_shimanami_keeper",
    src: "/assets/generated/characters/shimanami_keeper.png",
    required: true,
    description: "P12.1 generated regional NPC: ship keeper"
  }
];

const p12AssetIds = new Set([
  "bg_shimanami_A2_0_port_hub",
  "bg_shimanami_A2_1_bridge_route",
  "bg_shimanami_A2_2_island_village",
  "bg_shimanami_A2_3_watchtower",
  "bg_shimanami_A2_4_kamijima_path",
  "bg_shimanami_A2_5_wind_lighthouse",
  "enemy_shimanami_wind_thief",
  "enemy_shimanami_tide_crab",
  "enemy_shimanami_gull",
  "boss_shimanami_octopus",
  "npc_shimanami_keeper"
]);

export const p12AssetManifest: AssetManifest = {
  images: imageAssets.filter((asset) => p12AssetIds.has(asset.id))
};

export const coreAssetManifest: AssetManifest = {
  images: imageAssets.filter((asset) => !p12AssetIds.has(asset.id))
};

/** Full manifest retained for tooling and asset audits; the app loads area assets lazily. */
export const assetManifest: AssetManifest = {
  images: imageAssets
};
