import bpy, math

for model_name in ['liquid_logo.glb', 'Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb']:
    bpy.ops.wm.read_homefile(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=f'/home/shady/Downloads/interstellar/{model_name}')
    
    cam_data = bpy.data.cameras.new('Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 8
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = (0, -5, 0)
    cam.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.camera = cam
    bpy.ops.object.light_add(type='SUN', location=(0, -10, 10))
    
    out_path = f'/home/shady/Downloads/interstellar/render_{model_name}.png'
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 4
    bpy.context.scene.render.resolution_x = 600
    bpy.context.scene.render.resolution_y = 600
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f'Rendered {model_name} to {out_path}')
