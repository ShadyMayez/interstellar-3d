import bpy, math, os

GLB_PATH = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'

views = [
    ('plus_y',  (0, -3, 0), (math.radians(90), 0, 0)),
    ('minus_y', (0, 3, 0),  (math.radians(-90), 0, 0)),
    ('plus_z',  (0, 0, 3),  (0, 0, 0)),
    ('minus_z', (0, 0, -3), (0, math.radians(180), 0)),
]

for name, loc, rot in views:
    bpy.ops.wm.read_homefile(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=GLB_PATH)
    
    # Remove flat background plane geometry_0.001 & 0.005 if present
    for o in list(bpy.context.scene.objects):
        if o.type == 'MESH':
            bbox = o.bound_box
            ys = [b[1] for b in bbox]
            xs = [b[0] for b in bbox]
            zs = [b[2] for b in bbox]
            if (max(ys)-min(ys)) < 0.025 and (max(xs)-min(xs)) > 0.8:
                bpy.data.objects.remove(o, do_unlink=True)
                
    cam_data = bpy.data.cameras.new('Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 1.3
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = loc
    cam.rotation_euler = rot
    bpy.context.scene.camera = cam
    
    # Sun light from camera direction
    bpy.ops.object.light_add(type='SUN', location=loc)
    
    out_path = f'/home/shady/Downloads/interstellar/view_{name}.png'
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 4
    bpy.context.scene.render.resolution_x = 500
    bpy.context.scene.render.resolution_y = 500
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f'Rendered {name} to {out_path}')
