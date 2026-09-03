import bpy, math, os

GLB_PATH    = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'
OUTPUT_PATH = '/home/shady/Downloads/interstellar/active-theory-local-viewer/public/models/Copilot3D_clean.glb'
RENDER_OUT  = '/home/shady/Downloads/interstellar/clean_copilot_front.png'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

obj = bpy.context.scene.objects.get('geometry_0')
if obj:
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.separate(type='LOOSE')
    bpy.ops.object.mode_set(mode='OBJECT')
    
    loose_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    
    # Delete flat background planes (geometry_0.005, geometry_0.001)
    for o in loose_objs:
        bbox = o.bound_box
        ys = [b[1] for b in bbox]
        y_range = max(ys) - min(ys)
        xs = [b[0] for b in bbox]
        zs = [b[2] for b in bbox]
        x_span = max(xs) - min(xs)
        z_span = max(zs) - min(zs)
        
        if y_range < 0.025 and x_span > 0.8 and z_span > 0.8:
            print("Deleting background plane mesh:", o.name)
            bpy.data.objects.remove(o, do_unlink=True)

    # Join remaining 3D logo mark meshes
    remaining_objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    bpy.ops.object.select_all(action='DESELECT')
    for o in remaining_objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = remaining_objs[0]
    bpy.ops.object.join()
    
    clean_mesh = bpy.context.object
    clean_mesh.name = "Copilot3D_LogoMark"
    
    # NO rotation - model face is already facing front (+Z) after GLTF Y-up export!
    clean_mesh.rotation_euler.x = 0
    
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    clean_mesh.location = (0, 0, 0)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.shade_smooth()

    # Export clean GLB
    print("Exporting clean logo mark GLB to:", OUTPUT_PATH)
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

    # Render preview looking down -Z
    mat = bpy.data.materials.new("PreviewMat")
    mat.diffuse_color = (0.5, 0.1, 0.9, 1.0)
    clean_mesh.data.materials.clear()
    clean_mesh.data.materials.append(mat)

    cam_data = bpy.data.cameras.new('Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 1.3
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.scene.collection.objects.link(cam)

    cam.location = (0, 0, 5)
    cam.rotation_euler = (0, 0, 0)
    bpy.context.scene.camera = cam

    bpy.ops.object.light_add(type='SUN', location=(0, -5, 10))

    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 4
    bpy.context.scene.render.resolution_x = 600
    bpy.context.scene.render.resolution_y = 600
    bpy.context.scene.render.filepath = RENDER_OUT
    bpy.ops.render.render(write_still=True)
    print('Rendered clean copilot front to:', RENDER_OUT)
