import bpy, math, os

GLB_PATH = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        print("Object:", obj.name)
        bbox = obj.bound_box
        xs = [b[0] for b in bbox]
        ys = [b[1] for b in bbox]
        zs = [b[2] for b in bbox]
        print(f"X range: {min(xs):.3f} to {max(xs):.3f} (width: {max(xs)-min(xs):.3f})")
        print(f"Y range: {min(ys):.3f} to {max(ys):.3f} (width: {max(ys)-min(ys):.3f})")
        print(f"Z range: {min(zs):.3f} to {max(zs):.3f} (width: {max(zs)-min(zs):.3f})")
