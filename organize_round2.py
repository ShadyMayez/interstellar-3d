import os
import shutil

# Target directories to create
directories = [
    "assets/fonts",
    "assets/images/_scenelayout",
    "assets/images/pbr",
    "assets/images/particle",
    "assets/geometry/particles",
    "assets/geometry/hexgrid",
    "assets/geometry/work",
    "assets/geometry/tree_room",
    "assets/video"
]

for d in directories:
    os.makedirs(d, exist_ok=True)

# Define mappings based on new 404 logs
mappings = {
    # Font PNGs
    "NBArchitektStd-Regular.png": ["assets/fonts/NBArchitektStd-Regular.png"],
    "NBArchitektStd-Bold.png": ["assets/fonts/NBArchitektStd-Bold.png"],
    "NBArchitektStd-Light.png": ["assets/fonts/NBArchitektStd-Light.png"],
    
    # Scene layout textures
    "uv.jpg": ["assets/images/_scenelayout/uv.jpg"],
    "mask.jpg": ["assets/images/_scenelayout/mask.jpg"],
    "black.jpg": ["assets/images/_scenelayout/black.jpg", "assets/images/pbr/black.png"],
    "lab.jpg": ["assets/images/lab.jpg", "assets/images/lab.gif"],
    
    # PBR & Environment textures
    "lut.png": ["assets/images/pbr/lut.png"],
    "corsica_beach-specular-RGBM.png": ["assets/images/pbr/corsica_beach-specular-RGBM.png"],
    "corsica_beach-diffuse-RGBM.png": ["assets/images/pbr/corsica_beach-diffuse-RGBM.png"],
    "empty_mro.ktx2": ["assets/images/_scenelayout/empty_mro.ktx2"],
    "empty_normal.ktx2": ["assets/images/_scenelayout/empty_normal.ktx2"],
    "matcap3.ktx2": ["assets/images/particle/matcap3.ktx2"],
    "damaged_road_normal.png": ["assets/images/pbr/damaged_road_normal.jpg"],
    "reel-frame.jpg": ["assets/video/reel-frame.jpg"],
    
    # 3D models and JSON configs
    "forest-128.bin": ["assets/geometry/particles/forest-128.bin"],
    "flower_spine-128.bin": ["assets/geometry/particles/flower_spine-128.bin"],
    "hexagon_gem.bin": ["assets/geometry/hexgrid/hexagon_gem.bin"],
    "splines_anim4-SPLINES.json": ["assets/geometry/work/splines_anim4-SPLINES.json"]
}

for src, dests in mappings.items():
    if os.path.exists(src):
        for dest in dests:
            shutil.copy2(src, dest)
            print(f"Copied: {src} -> {dest}")
    else:
        print(f"Warning: File not found in root: {src}")

# Handle the missing cables.bin by copying cube.bin as a fallback placeholder
if os.path.exists("cube.bin"):
    shutil.copy2("cube.bin", "assets/geometry/tree_room/cables.bin")
    print("Copied cube.bin placeholder -> assets/geometry/tree_room/cables.bin")
else:
    print("Warning: cube.bin placeholder source not found!")
