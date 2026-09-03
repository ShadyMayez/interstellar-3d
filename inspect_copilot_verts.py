import bpy, math

GLB_PATH = '/home/shady/Downloads/interstellar/Copilot3D-53e6e99e-0c51-49cd-afd2-97338a2e762d.glb'

bpy.ops.wm.read_homefile(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB_PATH)

for obj in bpy.context.scene.objects:
    if obj.type == 'MESH':
        mesh = obj.data
        print(f"Mesh '{obj.name}' has {len(mesh.vertices)} vertices, {len(mesh.polygons)} polygons")
        # Sample first 10 vertex coordinates
        for i in range(min(10, len(mesh.vertices))):
            v = mesh.vertices[i].co
            print(f"  v[{i}]: ({v.x:.4f}, {v.y:.4f}, {v.z:.4f})")
