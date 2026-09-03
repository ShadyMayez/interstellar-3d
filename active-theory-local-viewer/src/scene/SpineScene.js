import * as THREE from 'three';
import { loadBinaryBuffer } from '../binViewer.js';
import { createIridescentMaterial } from './materials/iridescentMaterial.js';

export async function loadSpineMesh(dracoInstance) {
  const group = new THREE.Group();
  group.name = 'SpineGroup';

  try {
    const buffer = await loadBinaryBuffer('/assets/geometry/flower_spine-128.bin');
    if (dracoInstance && buffer) {
      const decoder = new dracoInstance.Decoder();
      const byteArray = new Uint8Array(buffer);
      const dracoBuffer = new dracoInstance.DecoderBuffer();
      dracoBuffer.Init(byteArray, byteArray.length);

      const geometryType = decoder.GetEncodedGeometryType(dracoBuffer);
      if (geometryType === dracoInstance.TRIANGULAR_MESH) {
        const mesh = new dracoInstance.Mesh();
        const status = decoder.DecodeBufferToMesh(dracoBuffer, mesh);

        if (status.ok()) {
          const geom = new THREE.BufferGeometry();
          
          // Position
          const posAttr = decoder.GetAttributeByUniqueId(mesh, dracoInstance.POSITION);
          if (posAttr) {
            const numPoints = mesh.num_points();
            const posData = new Float32Array(numPoints * 3);
            const dracoFloatArray = new dracoInstance.DracoFloat32Array();
            decoder.GetAttributeFloatForAllPoints(mesh, posAttr, dracoFloatArray);
            for (let i = 0; i < numPoints * 3; i++) {
              posData[i] = dracoFloatArray.getvalue(i);
            }
            geom.setAttribute('position', new THREE.BufferAttribute(posData, 3));
            dracoInstance.destroy(dracoFloatArray);
          }

          // Normals
          const normAttr = decoder.GetAttributeByUniqueId(mesh, dracoInstance.NORMAL);
          if (normAttr) {
            const numPoints = mesh.num_points();
            const normData = new Float32Array(numPoints * 3);
            const dracoFloatArray = new dracoInstance.DracoFloat32Array();
            decoder.GetAttributeFloatForAllPoints(mesh, normAttr, dracoFloatArray);
            for (let i = 0; i < numPoints * 3; i++) {
              normData[i] = dracoFloatArray.getvalue(i);
            }
            geom.setAttribute('normal', new THREE.BufferAttribute(normData, 3));
            dracoInstance.destroy(dracoFloatArray);
          }

          // Index
          const numFaces = mesh.num_faces();
          const numIndices = numFaces * 3;
          const indexData = new Uint32Array(numIndices);
          const dracoIntArray = new dracoInstance.DracoInt32Array();
          for (let i = 0; i < numFaces; i++) {
            decoder.GetFaceFromMesh(mesh, i, dracoIntArray);
            indexData[i * 3 + 0] = dracoIntArray.getvalue(0);
            indexData[i * 3 + 1] = dracoIntArray.getvalue(1);
            indexData[i * 3 + 2] = dracoIntArray.getvalue(2);
          }
          geom.setIndex(new THREE.BufferAttribute(indexData, 1));
          dracoInstance.destroy(dracoIntArray);

          geom.computeVertexNormals();

          // Build long continuous vertical backbone column of 10 connected spine segments
          const numSegments = 10;
          for (let i = 0; i < numSegments; i++) {
            const mat = createIridescentMaterial();
            const segmentMesh = new THREE.Mesh(geom, mat);
            segmentMesh.scale.set(1.4, 1.8, 1.4);
            const yPos = 5.0 - i * 2.2; // Spans vertically from +5.0 down to -14.8
            segmentMesh.position.set(0.6, yPos, -0.6);
            segmentMesh.rotation.y = i * 0.35;
            group.add(segmentMesh);
          }

          console.log('[SpineScene] Loaded long Draco backbone spine column (10 segments) successfully');
        }
        dracoInstance.destroy(mesh);
      }
      dracoInstance.destroy(dracoBuffer);
      dracoInstance.destroy(decoder);
    }
  } catch (err) {
    console.warn('[SpineScene] Spine binary mesh fallback:', err);
    const numSegments = 10;
    for (let i = 0; i < numSegments; i++) {
      const geom = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 32);
      const mat = createIridescentMaterial();
      const fallbackMesh = new THREE.Mesh(geom, mat);
      const yPos = 5.0 - i * 2.2;
      fallbackMesh.position.set(0.6, yPos, -0.6);
      fallbackMesh.rotation.y = i * 0.35;
      group.add(fallbackMesh);
    }
  }

  return group;
}
