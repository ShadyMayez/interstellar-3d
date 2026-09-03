import * as THREE from 'three';
import { loadBinaryBuffer } from '../binViewer.js';
import { createIridescentMaterial } from './materials/iridescentMaterial.js';

export async function loadSpineMesh(dracoInstance) {
  const group = new THREE.Group();
  group.name = 'SpineGroup';

  try {
    // 1. Load real authentic 3D backbone mesh file: spine.bin
    const buffer = await loadBinaryBuffer('/assets/geometry/spine.bin');
    if (buffer && dracoInstance) {
      const byteArray = new Uint8Array(buffer);
      
      // Find "DRACO" magic byte marker (skips JSON header)
      let dracoOffset = 0;
      for (let i = 0; i < byteArray.length - 5; i++) {
        if (
          byteArray[i] === 68 &&     // 'D'
          byteArray[i + 1] === 82 && // 'R'
          byteArray[i + 2] === 65 && // 'A'
          byteArray[i + 3] === 67 && // 'C'
          byteArray[i + 4] === 79    // 'O'
        ) {
          dracoOffset = i;
          break;
        }
      }

      const dracoSlice = dracoOffset > 0 ? byteArray.subarray(dracoOffset) : byteArray;

      const decoder = new dracoInstance.Decoder();
      const dracoBuffer = new dracoInstance.DecoderBuffer();
      dracoBuffer.Init(dracoSlice, dracoSlice.length);

      const mesh = new dracoInstance.Mesh();
      const status = decoder.DecodeBufferToMesh(dracoBuffer, mesh);

      if (status.ok()) {
        const geom = new THREE.BufferGeometry();
        const numPoints = mesh.num_points();
        const numFaces = mesh.num_faces();

        // Position
        const posAttr = decoder.GetAttribute(mesh, dracoInstance.POSITION);
        if (posAttr) {
          const posData = new Float32Array(numPoints * 3);
          const dracoFloatArray = new dracoInstance.DracoFloat32Array();
          decoder.GetAttributeFloatForAllPoints(mesh, posAttr, dracoFloatArray);
          for (let i = 0; i < numPoints * 3; i++) {
            posData[i] = dracoFloatArray.GetValue ? dracoFloatArray.GetValue(i) : dracoFloatArray.getvalue(i);
          }
          geom.setAttribute('position', new THREE.BufferAttribute(posData, 3));
          dracoInstance.destroy(dracoFloatArray);
        }

        // Normals
        const normAttr = decoder.GetAttribute(mesh, dracoInstance.NORMAL);
        if (normAttr) {
          const normData = new Float32Array(numPoints * 3);
          const dracoFloatArray = new dracoInstance.DracoFloat32Array();
          decoder.GetAttributeFloatForAllPoints(mesh, normAttr, dracoFloatArray);
          for (let i = 0; i < numPoints * 3; i++) {
            normData[i] = dracoFloatArray.GetValue ? dracoFloatArray.GetValue(i) : dracoFloatArray.getvalue(i);
          }
          geom.setAttribute('normal', new THREE.BufferAttribute(normData, 3));
          dracoInstance.destroy(dracoFloatArray);
        }

        // Indices
        const numIndices = numFaces * 3;
        const indexData = new Uint32Array(numIndices);
        const dracoIntArray = new dracoInstance.DracoInt32Array();
        for (let i = 0; i < numFaces; i++) {
          decoder.GetFaceFromMesh(mesh, i, dracoIntArray);
          indexData[i * 3 + 0] = dracoIntArray.GetValue ? dracoIntArray.GetValue(0) : dracoIntArray.getvalue(0);
          indexData[i * 3 + 1] = dracoIntArray.GetValue ? dracoIntArray.GetValue(1) : dracoIntArray.getvalue(1);
          indexData[i * 3 + 2] = dracoIntArray.GetValue ? dracoIntArray.GetValue(2) : dracoIntArray.getvalue(2);
        }
        geom.setIndex(new THREE.BufferAttribute(indexData, 1));
        dracoInstance.destroy(dracoIntArray);

        geom.computeVertexNormals();

        // 2. Build 40 continuous stacked instances of the authentic 3D backbone spine mesh
        const numSegments = 40;
        for (let i = 0; i < numSegments; i++) {
          const mat = createIridescentMaterial();
          const segmentMesh = new THREE.Mesh(geom, mat);
          segmentMesh.scale.set(2.3, 2.3, 2.3);
          const yPos = 4.0 - i * 0.42; // Spans vertically from +4.0 down to -12.4
          segmentMesh.position.set(0.6, yPos, -0.6);
          segmentMesh.rotation.y = i * 0.40;
          group.add(segmentMesh);
        }

        console.log(`[SpineScene] Loaded authentic 3D spine mesh (40 segments, ${numFaces} faces each) successfully`);
      }

      dracoInstance.destroy(mesh);
      dracoInstance.destroy(dracoBuffer);
      dracoInstance.destroy(decoder);
    }
  } catch (err) {
    console.error('[SpineScene] Error loading real 3D spine.bin mesh:', err);
  }

  return group;
}
