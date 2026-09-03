import bpy, math, os

GLB_PATH   = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'
RENDER_OUT = '/home/shady/Downloads/interstellar/copilot3d_framed.png'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

# Select imported objects and frame them
for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        obj.rotation_euler.x = math.radians(-90)
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
        obj.location = (0, 0, 0)
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

cam_data = bpy.data.cameras.new('Camera')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 1.5
cam = bpy.data.objects.new('Camera', cam_data)
bpy.context.scene.collection.objects.link(cam)

cam.location = (0, 0, 5)
cam.rotation_euler = (0, 0, 0)
bpy.context.scene.camera = cam

bpy.ops.object.light_add(type='SUN', location=(0, -5, 10))

bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 4
bpy.context.scene.render.resolution_x = 800
bpy.context.scene.render.resolution_y = 600
bpy.context.scene.render.filepath = RENDER_OUT
bpy.ops.render.render(write_still=True)
print('Rendered copilot3d framed to:', RENDER_OUT)
