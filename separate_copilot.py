import bpy, math

GLB_PATH = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

obj = bpy.context.scene.objects.get('geometry_0')
if obj:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    # Separate into loose parts
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.separate(type='LOOSE')
    bpy.ops.object.mode_set(mode='OBJECT')
    
    loose_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    print(f"Separated geometry_0 into {len(loose_objs)} loose meshes:")
    for o in loose_objs:
        bbox = o.bound_box
        xs = [b[0] for b in bbox]
        ys = [b[1] for b in bbox]
        zs = [b[2] for b in bbox]
        print(f"  Mesh '{o.name}': verts={len(o.data.vertices)}, bounds: X=({min(xs):.2f}..{max(xs):.2f}), Y=({min(ys):.2f}..{max(ys):.2f}), Z=({min(zs):.2f}..{max(zs):.2f})")
