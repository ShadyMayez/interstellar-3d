import os
import shutil

# Target directories to create
directories = [
    "assets/js/lib/_draco",
    "assets/js/lib",
    "assets/fonts",
    "assets/geometry/logo",
    "assets/geometry/particles",
    "assets/geometry/home",
    "assets/geometry/spine",
    "assets/geometry/tree_room",
    "assets/geometry/work",
    "assets/geometry/room",
    "assets/images/tree_room",
    "assets/images/pbr",
    "assets/images/room",
    "assets/images/home",
    "assets/images/work",
    "assets/images/ui",
    "assets/images"
]

for d in directories:
    os.makedirs(d, exist_ok=True)

# File mappings
mappings = {
    # WASM decoders and helper scripts
    "draco_decoder.wasm": ["assets/js/lib/_draco/draco_decoder.wasm"],
    "draco_wasm_wrapper.js": ["assets/js/lib/_draco/draco_wasm_wrapper.js"],
    "basis_transcoder.wasm": ["assets/js/lib/basis_transcoder.wasm"],
    "basis_transcoder.js": ["assets/js/lib/basis_transcoder.js"],
    "qrious.js": ["assets/js/lib/qrious.js"],
    "hydra-thread.js": ["assets/js/hydra-thread.js"], # copy here too just in case

    # Fonts
    "NBArchitektStd-Regular.json": ["assets/fonts/NBArchitektStd-Regular.json"],
    "NBArchitektStd-Bold.json": ["assets/fonts/NBArchitektStd-Bold.json"],
    "NBArchitektStd-Light.json": ["assets/fonts/NBArchitektStd-Light.json"],

    # 3D models (.bin)
    "AT_logo.bin": ["assets/geometry/logo/AT_logo.bin", "assets/geometry/particles/at_logo.bin", "assets/geometry/at_logo.bin"],
    "jellyfish.bin": ["assets/geometry/home/jellyfish.bin", "assets/geometry/jellyfish.bin"],
    "flower_spine-128.bin": ["assets/geometry/spine/spine.bin", "assets/geometry/spine/flower_spine-128.bin"],
    "forest-128.bin": ["assets/geometry/particles/tree-256.bin", "assets/geometry/forest-128.bin"],
    "pillars.bin": ["assets/geometry/tree_room/pillars.bin"],
    "rock_L.bin": ["assets/geometry/tree_room/rock_L.bin"],
    "rock_R.bin": ["assets/geometry/tree_room/rock_R.bin"],
    "rocky_soil.bin": ["assets/geometry/tree_room/rocky_soil.bin"],
    "sand.bin": ["assets/geometry/tree_room/sand.bin"],
    "structure.bin": ["assets/geometry/tree_room/structure.bin"],
    "walls.bin": ["assets/geometry/tree_room/walls.bin", "assets/geometry/room/walls.bin"],
    "chainlink.bin": ["assets/geometry/work/chainlink.bin"],
    "cube.bin": ["assets/geometry/work/cube.bin"],
    "mask.bin": ["assets/geometry/tree_room/mask.bin"],
    "hexagon_gem.bin": ["assets/geometry/work/hexagon_gem.bin", "assets/geometry/hexagon_gem.bin"],

    # KTX2 Textures
    "CABLES___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/CABLES___CyclesBake_COMBINED.ktx2"],
    "CABLES___PBR_AT_MRO.ktx2": ["assets/images/tree_room/CABLES___PBR_AT_MRO.ktx2"],
    "CABLES___PBR_Normal.ktx2": ["assets/images/tree_room/CABLES___PBR_Normal.ktx2"],
    "PILLARS___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/PILLARS___CyclesBake_COMBINED.ktx2"],
    "PILLARS___PBR_AT_MRO.ktx2": ["assets/images/tree_room/PILLARS___PBR_AT_MRO.ktx2"],
    "PILLARS___PBR_Normal.ktx2": ["assets/images/tree_room/PILLARS___PBR_Normal.ktx2"],
    "ROCKY_SOIL___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/ROCKY_SOIL___CyclesBake_COMBINED.ktx2"],
    "ROCKY_SOIL___PBR_AT_MRO.ktx2": ["assets/images/tree_room/ROCKY_SOIL___PBR_AT_MRO.ktx2"],
    "ROCKY_SOIL___PBR_Normal.ktx2": ["assets/images/tree_room/ROCKY_SOIL___PBR_Normal.ktx2"],
    "ROCK_L___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/ROCK_L___CyclesBake_COMBINED.ktx2"],
    "ROCK_L___PBR_AT_MRO.ktx2": ["assets/images/tree_room/ROCK_L___PBR_AT_MRO.ktx2"],
    "ROCK_L___PBR_Normal.ktx2": ["assets/images/tree_room/ROCK_L___PBR_Normal.ktx2"],
    "ROCK_R___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/ROCK_R___CyclesBake_COMBINED.ktx2"],
    "ROCK_R___PBR_AT_MRO.ktx2": ["assets/images/tree_room/ROCK_R___PBR_AT_MRO.ktx2"],
    "ROCK_R___PBR_Normal.ktx2": ["assets/images/tree_room/ROCK_R___PBR_Normal.ktx2"],
    "SAND___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/SAND___CyclesBake_COMBINED.ktx2"],
    "SAND___PBR_AT_MRO.ktx2": ["assets/images/tree_room/SAND___PBR_AT_MRO.ktx2"],
    "SAND___PBR_Normal.ktx2": ["assets/images/tree_room/SAND___PBR_Normal.ktx2"],
    "STRUCTURE___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/STRUCTURE___CyclesBake_COMBINED.ktx2"],
    "STRUCTURE___PBR_AT_MRO.ktx2": ["assets/images/tree_room/STRUCTURE___PBR_AT_MRO.ktx2"],
    "STRUCTURE___PBR_Normal.ktx2": ["assets/images/tree_room/STRUCTURE___PBR_Normal.ktx2"],
    "WALLS_CEILING___CyclesBake_COMBINED.ktx2": ["assets/images/tree_room/WALLS_CEILING___CyclesBake_COMBINED.ktx2"],
    "WALLS_CEILING___PBR_AT_MRO.ktx2": ["assets/images/tree_room/WALLS_CEILING___PBR_AT_MRO.ktx2"],
    "WALLS_CEILING___PBR_Normal.ktx2": ["assets/images/tree_room/WALLS_CEILING___PBR_Normal.ktx2"],
    
    "cliffs_MRO.ktx2": ["assets/images/pbr/cliffs_MRO.ktx2"],
    "woodplanks_normal.ktx2": ["assets/images/pbr/woodplanks_normal.ktx2"],
    "alien_cracked_2_basecolor.ktx2": ["assets/images/pbr/alien_cracked_2_basecolor.ktx2"],
    "cracked_ice_basecolor.ktx2": ["assets/images/pbr/cracked_ice_basecolor.ktx2"],
    "empty_mro.ktx2": ["assets/images/pbr/empty_mro.ktx2", "assets/images/empty_mro.ktx2"],
    "empty_normal.ktx2": ["assets/images/pbr/empty_normal.ktx2", "assets/images/empty_normal.ktx2"],
    "env1.ktx2": ["assets/images/work/env1.ktx2", "assets/images/env1.ktx2"],
    "matcap-test.ktx2": ["assets/images/room/matcap-test.ktx2"],
    "matcap3.ktx2": ["assets/images/home/matcap3.ktx2", "assets/images/matcap3.ktx2"],

    # Standard Images & Normal Maps
    "alien_cracked_2_normal.png": ["assets/images/pbr/alien_cracked_2_normal.png"],
    "corsica_beach-diffuse-RGBM.png": ["assets/images/room/corsica_beach-diffuse-RGBM.png", "assets/images/corsica_beach-diffuse-RGBM.png"],
    "corsica_beach-specular-RGBM.png": ["assets/images/room/corsica_beach-specular-RGBM.png", "assets/images/corsica_beach-specular-RGBM.png"],
    "damaged_road_basecolor.png": ["assets/images/pbr/damaged_road_basecolor.png"],
    "damaged_road_mro.png": ["assets/images/pbr/damaged_road_mro.png"],
    "damaged_road_normal.png": ["assets/images/pbr/damaged_road_normal.png"],
    "desert_bedrock_normal.png": ["assets/images/pbr/desert_bedrock_normal.png"],
    "jungle_soil_normal.png": ["assets/images/pbr/jungle_soil_normal.png"],
    "waternormals.jpg": ["assets/images/tree_room/waternormals.jpg"],
    "at-labrds.jpg": ["assets/images/ui/at-labrds.jpg"],
    "black.jpg": ["assets/images/pbr/black.jpg", "assets/images/black.jpg"],
    "mask.jpg": ["assets/images/mask.jpg"],
    "uv.jpg": ["assets/images/uv.jpg"],
    "video.jpg": ["assets/images/video.jpg"],
    
    # UI Icons
    "arrow.png": ["assets/images/ui/arrow.png", "assets/images/arrow.png"],
    "globe.png": ["assets/images/ui/globe.png", "assets/images/globe.png"],
    "ig.png": ["assets/images/ui/ig.png", "assets/images/ig.png"],
    "in.png": ["assets/images/ui/in.png", "assets/images/in.png"],
    "tw.png": ["assets/images/ui/tw.png", "assets/images/tw.png"],
    "star.png": ["assets/images/ui/star.png", "assets/images/star.png"]
}

for src, dests in mappings.items():
    if os.path.exists(src):
        for dest in dests:
            shutil.copy2(src, dest)
            print(f"Copied: {src} -> {dest}")
    else:
        print(f"Warning: File not found in root: {src}")

print("All remaining assets organized.")
