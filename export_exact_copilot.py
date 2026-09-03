import bpy, math, os

GLB_PATH    = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'
OUTPUT_PATH = '/home/shady/Downloads/interstellar/active-theory-local-viewer/public/models/Copilot3D_clean.glb'
RENDER_OUT  = '/home/shady/Downloads/interstellar/exact_copilot_face_pure.png'

print("=" * 60)
print("Extracting PURE Copilot3D Swollen Liquid Logo (Filtered)")
print("=" * 60)

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
    
    # Keep ONLY substantial 3D logo mark components (vertex count > 500)
    for o in loose_objs:
        if len(o.data.vertices) <= 500:
            print(f"Deleting small/wire mesh '{o.name}' (verts={len(o.data.vertices)})")
            bpy.data.objects.remove(o, do_unlink=True)
            continue
            
        bbox = o.bound_box
        ys = [b[1] for b in bbox]
        xs = [b[0] for b in bbox]
        zs = [b[2] for b in bbox]
        y_span = max(ys) - min(ys)
        x_span = max(xs) - min(xs)
        z_span = max(zs) - min(zs)
        
        # Also delete background flat plane (span > 0.8, y_span < 0.025)
        if y_span < 0.025 and x_span > 0.8 and z_span > 0.8:
            print(f"Deleting background plane mesh '{o.name}'")
            bpy.data.objects.remove(o, do_unlink=True)

    remaining = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    print(f"Joining {len(remaining)} 3D logo mark components...")
    bpy.ops.object.select_all(action='DESELECT')
    for o in remaining:
        o.select_set(True)
    bpy.context.view_layer.objects.active = remaining[0]
    bpy.ops.object.join()
    
    logo_mesh = bpy.context.object
    logo_mesh.name = "Copilot3D_SwollenLiquidLogo"
    
    logo_mesh.rotation_euler.x = 0
    logo_mesh.rotation_euler.y = 0
    logo_mesh.rotation_euler.z = 0
    
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    logo_mesh.location = (0, 0, 0)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.shade_smooth()

    # Export clean GLB
    print("Exporting pure Copilot3D GLB to:", OUTPUT_PATH)
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
    print("File size:", os.path.getsize(OUTPUT_PATH), "bytes")

    # Render preview looking from +Y down -Y
    mat = bpy.data.materials.new("PreviewMat")
    mat.diffuse_color = (0.5, 0.1, 0.9, 1.0)
    logo_mesh.data.materials.clear()
    logo_mesh.data.materials.append(mat)

    cam_data = bpy.data.cameras.new('Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = 1.3
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.scene.collection.objects.link(cam)

    cam.location = (0, -3, 0)
    cam.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.camera = cam

    bpy.ops.object.light_add(type='SUN', location=(0, -5, 5))

    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 4
    bpy.context.scene.render.resolution_x = 600
    bpy.context.scene.render.resolution_y = 600
    bpy.context.scene.render.filepath = RENDER_OUT
    bpy.ops.render.render(write_still=True)
    print('Rendered pure copilot face to:', RENDER_OUT)
