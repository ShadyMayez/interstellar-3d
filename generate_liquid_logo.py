#!/usr/bin/env python3
"""Generate an organic liquid-glass logo mesh as a GLB.

The mesh is created procedurally from a smooth 2D implicit silhouette with a
rounded triangular cutout, then inflated into a genuinely bulged 3D surface.
"""
from pathlib import Path
import numpy as np
from scipy.ndimage import distance_transform_edt
from skimage.measure import marching_cubes
from shapely.geometry import Point, LineString, Polygon
from shapely.affinity import scale, translate
from shapely import contains_xy
import trimesh

OUT = Path(__file__).resolve().parent / "liquid_logo.glb"

# Grid bounds and resolution. Increase resolution for an even smoother export.
XMIN, XMAX = -2.75, 2.55
YMIN, YMAX = -2.45, 2.00
ZMIN, ZMAX = -0.95, 0.95
NX, NY, NZ = 240, 205, 112


def ellipse(cx: float, cy: float, rx: float, ry: float, resolution: int = 192):
    disk = Point(0, 0).buffer(1.0, resolution=resolution)
    return translate(scale(disk, xfact=rx, yfact=ry, origin=(0, 0)), cx, cy)


def capsule(points, radius: float, resolution: int = 96):
    return LineString(points).buffer(radius, resolution=resolution, cap_style=1, join_style=1)


def build_silhouette():
    # Main swollen lobes.
    left = ellipse(-1.05, 0.48, 1.36, 1.08)
    right = ellipse(1.02, 0.24, 1.18, 0.77)

    # Narrow organic bridge and lower liquid structure.
    bridge = capsule([(-0.55, 0.22), (-0.12, 0.05), (0.42, 0.08), (0.82, 0.22)], 0.38)
    tail = capsule([(0.18, -0.10), (0.35, -0.52), (0.28, -1.18), (0.18, -1.58)], 0.49)
    left_arm = capsule([(-0.75, -0.20), (-0.35, -0.42), (0.12, -0.76)], 0.35)
    right_arm = capsule([(0.78, -0.14), (0.52, -0.42), (0.18, -0.80)], 0.34)

    body = left.union(right).union(bridge).union(tail).union(left_arm).union(right_arm)

    # Gentle morphological smoothing keeps the outline liquid instead of Boolean-sharp.
    body = body.buffer(0.08, resolution=96, join_style=1).buffer(-0.08, resolution=96, join_style=1)

    # Rounded inverted triangular hole.
    hole_core = Polygon([(-0.36, -0.14), (0.48, -0.15), (0.10, -0.92)])
    hole = hole_core.buffer(0.115, resolution=96, join_style=1)

    # Keep a substantial glass rim around the opening.
    return body.difference(hole)


def make_mesh():
    silhouette = build_silhouette()

    xs = np.linspace(XMIN, XMAX, NX, dtype=np.float32)
    ys = np.linspace(YMIN, YMAX, NY, dtype=np.float32)
    zs = np.linspace(ZMIN, ZMAX, NZ, dtype=np.float32)
    dx = float(xs[1] - xs[0])
    dy = float(ys[1] - ys[0])
    dz = float(zs[1] - zs[0])

    xx, yy = np.meshgrid(xs, ys, indexing="ij")
    mask2d = contains_xy(silhouette, xx, yy)

    # Signed 2D distance in world units: positive inside, negative outside.
    d_inside = distance_transform_edt(mask2d, sampling=(dx, dy))
    d_outside = distance_transform_edt(~mask2d, sampling=(dx, dy))
    signed2d = (d_inside - d_outside).astype(np.float32)

    # Vary depth by region: the left lobe is especially swollen, while the
    # bridge stays narrower. The surface still closes smoothly at every edge.
    left_bulge = np.exp(-(((xx + 1.05) / 1.15) ** 2 + ((yy - 0.48) / 0.95) ** 2))
    right_bulge = np.exp(-(((xx - 1.02) / 1.05) ** 2 + ((yy - 0.24) / 0.70) ** 2))
    tail_bulge = np.exp(-(((xx - 0.22) / 0.48) ** 2 + ((yy + 1.02) / 0.85) ** 2))
    bridge_thinner = np.exp(-(((xx - 0.03) / 0.85) ** 2 + ((yy - 0.08) / 0.34) ** 2))

    depth_scale = (
        0.57
        + 0.17 * left_bulge
        + 0.08 * right_bulge
        + 0.07 * tail_bulge
        - 0.07 * bridge_thinner
    ).astype(np.float32)

    zterm = (np.abs(zs)[None, None, :] / depth_scale[:, :, None]) ** 2.15
    field = signed2d[:, :, None] - zterm.astype(np.float32)

    # Marching cubes returns vertices in grid index space; spacing converts to world units.
    verts, faces, normals, _ = marching_cubes(
        field,
        level=0.0,
        spacing=(dx, dy, dz),
        allow_degenerate=False,
        method="lewiner",
    )
    verts[:, 0] += XMIN
    verts[:, 1] += YMIN
    verts[:, 2] += ZMIN

    mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals, process=True)

    # Small Taubin pass removes voxel-frequency noise without shrinking the liquid silhouette.
    trimesh.smoothing.filter_taubin(mesh, lamb=0.46, nu=-0.50, iterations=8)
    mesh.remove_unreferenced_vertices()
    mesh.fix_normals()
    if mesh.volume < 0:
        mesh.invert()

    # Vertex color fallback: navy at left, violet through center, hot magenta on right/tail.
    v = mesh.vertices
    t = np.clip((v[:, 0] + 1.10) / 2.35, 0.0, 1.0)
    tail = np.clip((-v[:, 1] - 0.20) / 1.45, 0.0, 1.0)
    t = np.clip(t + 0.28 * tail, 0.0, 1.0)

    navy = np.array([3, 8, 48], dtype=np.float32)
    violet = np.array([66, 8, 153], dtype=np.float32)
    magenta = np.array([255, 5, 221], dtype=np.float32)
    mid = np.clip(t * 2.0, 0.0, 1.0)[:, None]
    hi = np.clip((t - 0.5) * 2.0, 0.0, 1.0)[:, None]
    c1 = navy[None, :] * (1.0 - mid) + violet[None, :] * mid
    colors = c1 * (1.0 - hi) + magenta[None, :] * hi
    alpha = np.full((len(colors), 1), 255, dtype=np.float32)
    mesh.visual.vertex_colors = np.clip(np.concatenate([colors, alpha], axis=1), 0, 255).astype(np.uint8)

    # Center at origin for easier Three.js framing.
    mesh.apply_translation(-mesh.bounding_box.centroid)

    print(f"vertices={len(mesh.vertices):,} faces={len(mesh.faces):,}")
    print(f"watertight={mesh.is_watertight} volume={mesh.volume:.3f}")
    mesh.export(OUT, file_type="glb")
    print(f"wrote {OUT} ({OUT.stat().st_size / 1024 / 1024:.2f} MB)")


if __name__ == "__main__":
    make_mesh()
