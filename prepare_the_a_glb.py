import bpy, math, os

STL_PATH   = '/home/shady/Downloads/interstellar/the a.stl'
OUT_GLB    = '/home/shady/Downloads/interstellar/active-theory-local-viewer/public/models/the_a_clean.glb'
RENDER_OUT = '/home/shady/Downloads/interstellar/the_a_clean_preview.png'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.wm.stl_import(filepath=STL_PATH)

obj = bpy.context.scene.objects[0]
bpy.context.view_layer.objects.active = obj
obj.select_set(True)

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.separate(type='LOOSE')
bpy.ops.object.mode_set(mode='OBJECT')

loose = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print(f"Loose components in 'the a.stl': {len(loose)}")

for idx, o in enumerate(loose):
    bbox = o.bound_box
    xs = [b[0] for b in bbox]
    ys = [b[1] for b in bbox]
    zs = [b[2] for b in bbox]
    print(f"  #{idx} '{o.name}': verts={len(o.data.vertices)}, bounds X=({min(xs):.1f}..{max(xs):.1f}), Y=({min(ys):.1f}..{max(ys):.1f}), Z=({min(zs):.1f}..{max(zs):.1f})")
    
    # Delete flat background boxes if present
    x_span = max(xs) - min(xs)
    y_span = max(ys) - min(ys)
    z_span = max(zs) - min(zs)
    if y_span < 2.0 and x_span > 90 and z_span > 90:
        print(f"Deleting background box '{o.name}'")
        bpy.data.objects.remove(o, do_unlink=True)

remaining = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print(f"Remaining 'a' components: {len(remaining)}")

if len(remaining) > 1:
    bpy.ops.object.select_all(action='DESELECT')
    for o in remaining:
        o.select_set(True)
    bpy.context.view_layer.objects.active = remaining[0]
    bpy.ops.object.join()

a_mesh = bpy.context.object
a_mesh.name = "TheA_SwollenLiquid"

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
a_mesh.location = (0, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.shade_smooth()

print("Exporting clean 'a' GLB to:", OUT_GLB)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_normals=True,
    export_tangents=False,
    export_materials='NONE',
    export_yup=True,
    export_cameras=False,
    export_lights=False,
)

# Render front preview
mat = bpy.data.materials.new("AMat")
mat.diffuse_color = (0.9, 0.05, 0.9, 1.0)
a_mesh.data.materials.clear()
a_mesh.data.materials.append(mat)

cam_data = bpy.data.cameras.new('Camera')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 120
cam = bpy.data.objects.new('Camera', cam_data)
bpy.context.scene.collection.objects.link(cam)
cam.location = (0, -100, 0)
cam.rotation_euler = (math.radians(90), 0, 0)
bpy.context.scene.camera = cam

bpy.ops.object.light_add(type='SUN', location=(0, -100, 100))

bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 4
bpy.context.scene.render.resolution_x = 500
bpy.context.scene.render.resolution_y = 500
bpy.context.scene.render.filepath = RENDER_OUT
bpy.ops.render.render(write_still=True)
print('Rendered clean preview to:', RENDER_OUT)
