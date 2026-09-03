import bpy, math, os

STL_PATH   = '/home/shady/Downloads/interstellar/the a.stl'
RENDER_OUT = '/home/shady/Downloads/interstellar/the_a_stl_preview.png'

print("=" * 60)
print("Inspecting STL file:", STL_PATH)
print("=" * 60)

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.wm.stl_import(filepath=STL_PATH)

objs = [o for o in bpy.context.scene.objects if o.type == 'MESH']
print(f"Imported {len(objs)} mesh object(s)")

if objs:
    a_mesh = objs[0]
    print(f"Object name: '{a_mesh.name}'")
    print(f"Vertex count: {len(a_mesh.data.vertices)}")
    print(f"Polygon count: {len(a_mesh.data.polygons)}")
    
    bbox = a_mesh.bound_box
    xs = [b[0] for b in bbox]
    ys = [b[1] for b in bbox]
    zs = [b[2] for b in bbox]
    print(f"Bounding box:")
    print(f"  X: {min(xs):.3f} to {max(xs):.3f} (width: {max(xs)-min(xs):.3f})")
    print(f"  Y: {min(ys):.3f} to {max(ys):.3f} (depth: {max(ys)-min(ys):.3f})")
    print(f"  Z: {min(zs):.3f} to {max(zs):.3f} (height: {max(zs)-min(zs):.3f})")

    # Render preview
    mat = bpy.data.materials.new("AMat")
    mat.diffuse_color = (0.8, 0.05, 0.9, 1.0)
    a_mesh.data.materials.clear()
    a_mesh.data.materials.append(mat)

    cam_data = bpy.data.cameras.new('Camera')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = max(max(xs)-min(xs), max(zs)-min(zs)) * 1.5
    cam = bpy.data.objects.new('Camera', cam_data)
    bpy.context.scene.collection.objects.link(cam)

    # Position camera looking at mesh center
    cx = (min(xs) + max(xs)) / 2.0
    cy = (min(ys) + max(ys)) / 2.0
    cz = (min(zs) + max(zs)) / 2.0

    cam.location = (cx, cy - 10, cz)
    cam.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.camera = cam

    bpy.ops.object.light_add(type='SUN', location=(cx, cy - 5, cz + 10))

    bpy.context.scene.render.engine = 'CYCLES'
    bpy.context.scene.cycles.samples = 4
    bpy.context.scene.render.resolution_x = 500
    bpy.context.scene.render.resolution_y = 500
    bpy.context.scene.render.filepath = RENDER_OUT
    bpy.ops.render.render(write_still=True)
    print('Rendered preview to:', RENDER_OUT)
