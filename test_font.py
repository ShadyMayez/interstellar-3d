import bpy
import math
import os

FONT_PATH   = '/home/shady/Downloads/interstellar/NBArchitektStd-Bold.ttf'
RENDER_OUT  = '/home/shady/Downloads/interstellar/test_nbarch.png'

bpy.ops.wm.read_homefile(use_empty=True)

font = bpy.data.fonts.load(FONT_PATH)
bpy.ops.object.text_add(location=(0, 0, 0))
text_obj = bpy.context.object
text_obj.data.body = 'Interstellar'
text_obj.data.font = font
text_obj.data.extrude = 0.08
text_obj.data.bevel_depth = 0.02
text_obj.data.bevel_resolution = 4
text_obj.data.align_x = 'CENTER'
text_obj.data.align_y = 'CENTER'

bpy.ops.object.select_all(action='DESELECT')
text_obj.select_set(True)
bpy.context.view_layer.objects.active = text_obj
bpy.ops.object.convert(target='MESH')
mesh_obj = bpy.context.object

# Frame camera looking at text face (+Z)
cam_data = bpy.data.cameras.new('Camera')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 8
cam = bpy.data.objects.new('Camera', cam_data)
bpy.context.scene.collection.objects.link(cam)
cam.location = (0, 0, 5)
cam.rotation_euler = (0, 0, 0) # look down -Z at text face
bpy.context.scene.camera = cam

bpy.ops.object.light_add(type='SUN', location=(0, -5, 10))

bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 4
bpy.context.scene.render.resolution_x = 1000
bpy.context.scene.render.resolution_y = 300
bpy.context.scene.render.filepath = RENDER_OUT
bpy.ops.render.render(write_still=True)
print('Rendered test to:', RENDER_OUT)
