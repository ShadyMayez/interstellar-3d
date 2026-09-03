import bpy, math, os

STL_PATH   = '/home/shady/Downloads/interstellar/the a.stl'
OUT_GLB    = '/home/shady/Downloads/interstellar/active-theory-local-viewer/public/models/the_a_clean.glb'
RENDER_OUT = '/home/shady/Downloads/interstellar/the_a_isolated_preview.png'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.wm.stl_import(filepath=STL_PATH)

obj = bpy.context.scene.objects[0]
mesh = obj.data

# Find vertices belonging to the background plate (which lies at Y < -5.0 or outer square box)
print(f"Total vertices before cleanup: {len(mesh.vertices)}")

bpy.context.view_layer.objects.active = obj
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')

# Select vertices with Y < -5.0 (the backplate)
import bmesh
bm = bmesh.from_edit_mesh(mesh)
for v in bm.verts:
    # The background plate is flat and lies behind Y = -6.0
    if v.co.y < -5.0:
        v.select = True

# Delete backplate vertices
bmesh.update_edit_mesh(mesh)
bpy.ops.mesh.delete(type='VERT')

# Clean loose mesh geometry
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='LOOSE')
bpy.ops.object.mode_set(mode='OBJECT')

loose = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print(f"Loose components after removing backplate: {len(loose)}")

for o in loose:
    bbox = o.bound_box
    xs = [b[0] for b in bbox]
    ys = [b[1] for b in bbox]
    zs = [b[2] for b in bbox]
    print(f"  Component '{o.name}': verts={len(o.data.vertices)}, X=({min(xs):.1f}..{max(xs):.1f}), Y=({min(ys):.1f}..{max(ys):.1f}), Z=({min(zs):.1f}..{max(zs):.1f})")

# Keep the main 'a' mesh (largest vertex count)
loose.sort(key=lambda o: len(o.data.vertices), reverse=True)
main_a = loose[0]
for o in loose[1:]:
    bpy.data.objects.remove(o, do_unlink=True)

main_a.name = "TheA_Isolated"
bpy.context.view_layer.objects.active = main_a
main_a.select_set(True)

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
main_a.location = (0, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.shade_smooth()

print("Exporting isolated 'a' GLB to:", OUT_GLB)
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

# Render front view
mat = bpy.data.materials.new("AMat")
mat.diffuse_color = (0.85, 0.05, 0.95, 1.0)
main_a.data.materials.clear()
main_a.data.materials.append(mat)

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
print('Rendered isolated preview to:', RENDER_OUT)
