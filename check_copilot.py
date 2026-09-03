import bpy, math, os

GLB_PATH   = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'
RENDER_OUT = '/home/shady/Downloads/interstellar/copilot3d_front.png'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

# Frame camera looking straight at imported mesh
cam_data = bpy.data.cameras.new('Camera')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 12
cam = bpy.data.objects.new('Camera', cam_data)
bpy.context.scene.collection.objects.link(cam)

# Try looking from +Z
cam.location = (0, 0, 10)
cam.rotation_euler = (0, 0, 0)
bpy.context.scene.camera = cam

bpy.ops.object.light_add(type='SUN', location=(0, -5, 10))

bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 4
bpy.context.scene.render.resolution_x = 800
bpy.context.scene.render.resolution_y = 600
bpy.context.scene.render.filepath = RENDER_OUT
bpy.ops.render.render(write_still=True)
print('Rendered copilot3d front to:', RENDER_OUT)
