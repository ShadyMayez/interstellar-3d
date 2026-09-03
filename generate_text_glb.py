import bpy
import math
import os

FONT_PATH   = '/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Bold.otf'
OUTPUT_PATH = '/home/shady/Downloads/interstellar/interstellar_text_montserrat.glb'

print("=" * 60)
print("Generating 3D Text GLB: Interstellar (Montserrat Bold)")
print("=" * 60)

bpy.ops.wm.read_homefile(use_empty=True)

font = bpy.data.fonts.load(FONT_PATH)
bpy.ops.object.text_add(location=(0, 0, 0))
text_obj = bpy.context.object
text_obj.name = "InterstellarText"
text_obj.data.body = "Interstellar"
text_obj.data.font = font
text_obj.data.extrude = 0.15
text_obj.data.bevel_depth = 0.015
text_obj.data.bevel_resolution = 4
text_obj.data.align_x = 'CENTER'
text_obj.data.align_y = 'CENTER'
text_obj.data.size = 1.0

bpy.ops.object.select_all(action='DESELECT')
text_obj.select_set(True)
bpy.context.view_layer.objects.active = text_obj
bpy.ops.object.convert(target='MESH')
mesh_obj = bpy.context.object
mesh_obj.name = "InterstellarTextMesh"

bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
mesh_obj.location = (0, 0, 0)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

bpy.ops.object.mode_set(mode='EDIT')
bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.mesh.normals_make_consistent(inside=False)
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.object.shade_smooth()

bpy.ops.object.select_all(action='DESELECT')
mesh_obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
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

print("Exported GLB to:", OUTPUT_PATH)
print("File size:", os.path.getsize(OUTPUT_PATH), "bytes")
