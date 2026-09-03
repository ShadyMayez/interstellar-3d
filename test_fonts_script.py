import bpy, math, os

fonts_to_test = [
    ('/usr/share/fonts/julietaula-montserrat-fonts/Montserrat-Bold.otf', 'montserrat'),
    ('/usr/share/fonts/adwaita-sans-fonts/AdwaitaSans-Regular.ttf', 'adwaita'),
]

for font_path, name in fonts_to_test:
    if not os.path.exists(font_path):
        print("Font not found:", font_path)
        continue
    bpy.ops.wm.read_homefile(use_empty=True)
    font = bpy.data.fonts.load(font_path)
    bpy.ops.object.text_add(location=(0, 0, 0))
    t = bpy.context.object
    t.data.body = 'Interstellar'
    t.data.font = font
    t.data.extrude = 0.08
    t.data.bevel_depth = 0.02
    t.data.bevel_resolution = 4
    t.data.align_x = 'CENTER'
    t.data.align_y = 'CENTER'
    
    bpy.ops.object.select_all(action='DESELECT')
    t.select_set(True)
    bpy.context.view_layer.objects.active = t
    bpy.ops.object.convert(target='MESH')
    
    cam_data = bpy.data.cameras.new('Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 8
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = (0, 0, 5)
    cam.rotation_euler = (0, 0, 0)
    bpy.context.scene.camera = cam
    bpy.ops.object.light_add(type='SUN', location=(0, -5, 10))
    
    out_path = f'/home/shady/Downloads/interstellar/test_{name}.png'
    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 4
    bpy.context.scene.render.resolution_x = 1000
    bpy.context.scene.render.resolution_y = 300
    bpy.context.scene.render.filepath = out_path
    bpy.ops.render.render(write_still=True)
    print(f'Rendered {name} to {out_path}')
