# dogo_map_foreground.png

Generate a transparent foreground layer for the generated Dogo Onsen 2.5D exploration map.

Reference:
- docs/visual-reference/key-visuals/02_dogo_exploration.png

Requirements:
- Transparent-background PNG style asset.
- Same general 16:9 composition as dogo_map_base.png.
- Include only elements that should appear in front of characters: hanging lanterns, roof eaves, bridge rails, tree branches, flowers, mikan leaves, soft steam puffs.
- Hand-drawn picture-book style, pale watercolor and gouache, thin ink lines.
- No characters, enemies, UI, or text.
- Use bright chroma-key magenta background only if true transparency is unavailable, so it can be removed after generation.

Output:
- Runtime destination: public/assets/generated/backgrounds/dogo_map_foreground.png

