# AXLERA / AXLORA Heavy Liquid 3D Logo Model

This zip contains a real 3D model generated from your uploaded logo silhouette. It is intended for use in a Three.js/WebGL website hero section.

## Main files

- `models/axlera_liquid_logo.glb` — main 3D model, vertex-colored.
- `models/axlera_liquid_logo_low.glb` — lighter fallback model.
- `models/axlera_liquid_logo.obj` — OBJ export for general 3D tools.
- `models/axlera_liquid_logo.ply` — vertex-color mesh export.
- `models/axlera_liquid_logo.stl` — geometry-only mesh export.
- `textures/source_logo_upscaled.png` — upscaled original logo texture reference.
- `textures/liquid_flow_map.png` — generated flow-direction guide texture.
- `implementation/threejs_loader_liquid_shader.js` — Three.js loader + shader reference.
- `implementation/ANTIGRAVITY_PROMPT.txt` — prompt to give Antigravity.

## Mesh details

High model:
- Vertices: 160,782
- Faces: 319,330

Low model:
- Vertices: 50,976
- Faces: 100,750

## Notes

The GLB contains a static mesh and baked vertex colors. For the animated heavy-liquid flow effect, use the included Three.js shader snippet or ask Antigravity to implement the prompt inside `implementation/ANTIGRAVITY_PROMPT.txt`.

The model is centered, Y-up, and ready for Three.js.
