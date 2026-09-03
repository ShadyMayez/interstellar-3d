import bpy, math, os, bmesh, shutil

FONT_PATH   = '/usr/share/fonts/google-droid-sans-fonts/DroidSans-Bold.ttf'
STL_A_PATH  = '/home/shady/Downloads/interstellar/the a.stl'
OUT_GLB1    = '/home/shady/Downloads/interstellar/active-theory-local-viewer/public/models/interstellar_text.glb'
OUT_GLB2    = '/home/shady/Downloads/interstellar/active-theory-local-viewer/public/assets/geometry/interstellar_text.glb'
RENDER_OUT  = '/home/shady/Downloads/interstellar/baked_text_preview_clean.png'

print("=" * 60)
print("Baking 3D Text 'Interstellar' with User's Custom 3D 'a' Model")
print("=" * 60)

bpy.ops.wm.read_homefile(use_empty=True)

font = None
if os.path.exists(FONT_PATH):
    font = bpy.data.fonts.load(FONT_PATH)

# Left text "Interstell"
txt_left_data = bpy.data.curves.new(name="TxtLeftCurve", type='FONT')
if font:
    txt_left_data.font = font
txt_left_data.body = "Interstell"
txt_left_data.size = 1.0
txt_left_data.extrude = 0.14
txt_left_data.bevel_depth = 0.020

txt_left_obj = bpy.data.objects.new("TextLeft", txt_left_data)
bpy.context.scene.collection.objects.link(txt_left_obj)

# Right text "r"
txt_right_data = bpy.data.curves.new(name="TxtRightCurve", type='FONT')
if font:
    txt_right_data.font = font
txt_right_data.body = "r"
txt_right_data.size = 1.0
txt_right_data.extrude = 0.14
txt_right_data.bevel_depth = 0.020

txt_right_obj = bpy.data.objects.new("TextRight", txt_right_data)
bpy.context.scene.collection.objects.link(txt_right_obj)

# Convert text curves to mesh
bpy.context.view_layer.objects.active = txt_left_obj
txt_left_obj.select_set(True)
bpy.ops.object.convert(target='MESH')

bpy.context.view_layer.objects.active = txt_right_obj
txt_right_obj.select_set(True)
bpy.ops.object.convert(target='MESH')

# Calculate bounding box of left text "Interstell"
bbox_left = txt_left_obj.bound_box
xs_left = [b[0] for b in bbox_left]
ys_left = [b[1] for b in bbox_left]
zs_left = [b[2] for b in bbox_left]
left_max_x = max(xs_left)
text_height = max(ys_left) - min(ys_left)

# 2. Import & Clean the User's 'a' STL
bpy.ops.wm.stl_import(filepath=STL_A_PATH)
stl_a_obj = [o for o in bpy.context.scene.objects if 'the a' in o.name.lower() or 'stl' in o.name.lower()][0]

bpy.context.view_layer.objects.active = stl_a_obj
bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='DESELECT')

mesh_a = stl_a_obj.data
bm = bmesh.from_edit_mesh(mesh_a)
for v in bm.verts:
    if abs(v.co.x) > 36.0 or abs(v.co.z) > 36.0 or v.co.y < -1.0:
        v.select = True

bmesh.update_edit_mesh(mesh_a)
bpy.ops.mesh.delete(type='VERT')

bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.separate(type='LOOSE')
bpy.ops.object.mode_set(mode='OBJECT')

loose_a = [o for o in bpy.context.scene.objects if 'the a' in o.name.lower()]
loose_a.sort(key=lambda o: len(o.data.vertices), reverse=True)
pure_a_obj = loose_a[0]
for o in loose_a[1:]:
    bpy.data.objects.remove(o, do_unlink=True)

pure_a_obj.name = "Custom_3D_Letter_A"

# In STL, face is in XZ plane. Rotate X by +90 deg so face lies in XY plane facing +Z
pure_a_obj.rotation_euler.x = math.radians(90)
bpy.context.view_layer.objects.active = pure_a_obj
bpy.ops.object.transform_apply(rotation=True)
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')

# Scale and position custom 'a' right after "Interstell"
bbox_a = pure_a_obj.bound_box
xs_a = [b[0] for b in bbox_a]
ys_a = [b[1] for b in bbox_a]
height_a = max(ys_a) - min(ys_a)

target_a_height = text_height * 0.92
scale_factor = target_a_height / height_a
pure_a_obj.scale = (scale_factor, scale_factor, scale_factor)
bpy.ops.object.transform_apply(scale=True)

a_width = max(xs_a) - min(xs_a)
a_center_x = left_max_x + a_width * 0.5 + 0.08
pure_a_obj.location = (a_center_x, (min(ys_left) + max(ys_left)) / 2.0, 0.05)

# Position right text "r" after 'a'
txt_right_obj.location = (left_max_x + a_width + 0.16, 0.0, 0.0)

# Join left and right main font text into "TextMain"
bpy.ops.object.select_all(action='DESELECT')
txt_left_obj.select_set(True)
txt_right_obj.select_set(True)
bpy.context.view_layer.objects.active = txt_left_obj
bpy.ops.object.join()

text_main = bpy.context.object
text_main.name = "TextMain"

# Center assembly X at 0
assembly_objs = [text_main, pure_a_obj]
min_x_total = min([o.matrix_world @ v.co for o in assembly_objs for v in o.data.vertices], key=lambda p: p.x).x
max_x_total = max([o.matrix_world @ v.co for o in assembly_objs for v in o.data.vertices], key=lambda p: p.x).x
center_offset_x = (min_x_total + max_x_total) / 2.0

for o in assembly_objs:
    o.location.x -= center_offset_x
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.shade_smooth()

# Export clean GLB to BOTH locations
print("Exporting complete 3D text GLB to:", OUT_GLB1)
os.makedirs(os.path.dirname(OUT_GLB1), exist_ok=True)
os.makedirs(os.path.dirname(OUT_GLB2), exist_ok=True)

bpy.ops.export_scene.gltf(
    filepath=OUT_GLB1,
    export_format='GLB',
    use_selection=False,
    export_apply=True,
    export_normals=True,
    export_tangents=False,
    export_materials='NONE',
    export_yup=True,
    export_cameras=False,
    export_lights=False,
)

shutil.copyfile(OUT_GLB1, OUT_GLB2)
print("Copied GLB to:", OUT_GLB2)
print("GLB file size:", os.path.getsize(OUT_GLB1), "bytes")

# Render preview
mat_main = bpy.data.materials.new("MatMain")
mat_main.diffuse_color = (0.02, 0.08, 0.25, 1.0)
text_main.data.materials.clear()
text_main.data.materials.append(mat_main)

mat_a = bpy.data.materials.new("MatA")
mat_a.diffuse_color = (0.85, 0.05, 0.95, 1.0)
pure_a_obj.data.materials.clear()
pure_a_obj.data.materials.append(mat_a)

cam_data = bpy.data.cameras.new('Camera')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 8.5
cam = bpy.data.objects.new('Camera', cam_data)
bpy.context.scene.collection.objects.link(cam)
cam.location = (0, 0, 10)
cam.rotation_euler = (0, 0, 0)
bpy.context.scene.camera = cam

bpy.ops.object.light_add(type='SUN', location=(0, -10, 20))

bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 4
bpy.context.scene.render.resolution_x = 800
bpy.context.scene.render.resolution_y = 400
bpy.context.scene.render.filepath = RENDER_OUT
bpy.ops.render.render(write_still=True)
print('Rendered text preview to:', RENDER_OUT)
