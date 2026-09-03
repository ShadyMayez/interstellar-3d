import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function makeMasterLogoMaterial(geometry) {
  geometry.computeBoundingBox();
  const min = geometry.boundingBox.min;
  const max = geometry.boundingBox.max;

  return new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uMin: { value: min.clone() },
      uMax: { value: max.clone() }
    },
    vertexShader: /* glsl */`
      varying vec3 vObjectPosition;
      varying vec3 vWorldPosition;
      varying vec3 vNormalW;
      void main() {
        vObjectPosition = position;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPosition = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uTime;
      uniform vec3 uMin;
      uniform vec3 uMax;
      varying vec3 vObjectPosition;
      varying vec3 vWorldPosition;
      varying vec3 vNormalW;

      vec3 getMappedPos(vec3 pos) {
        vec3 norm = (pos - uMin) / (uMax - uMin + 1e-5);
        vec3 targetMin = vec3(-2.305, -1.810, -0.730);
        vec3 targetMax = vec3(2.305, 1.810, 0.730);
        return targetMin + norm * (targetMax - targ
        obj.geometry.computeVertexNormals();
        obj.geometry.computeBoundingSphere();

        const masterMat = makeMasterLogoMaterial(obj.geometry);
        obj.material = masterMat;
        animatedMaterials.push(masterMat);
      }
    });

    logoGroup.add(logoMeshGroup);
  }, undefined, (err) => {
    console.error('[LogoScene] Failed to load Copilot3D_clean.glb:', err);
  });

  // Load Pristine 3D Text Mesh (Company Name Interstellar generated with Blender)
  loader.load('/assets/geometry/interstellar_text.glb', (gltf) => {
    const textScene = gltf.scene;

    const bbox = new THREE.Box3().setFromObject(textScene);
    const center = bbox.getCenter(new THREE.Vector3());

    // -90° on X = face camera. Negate Y scale only to flip right-side up WITHOUT mirroring X.
    textScene.rotation.x = -Math.PI / 2;
    textScene.scale.set(3.0, -3.0, 3.0);

    // Position to the RIGHT of the logo mark with clear gap
    textScene.position.set(-center.x + 5.5, 0.0, -center.z + 0.0);

    textScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry.computeVertexNormals();

        const textMat = makeMasterTextMaterial(obj.geometry);
        obj.material = textMat;
        animatedMaterials.push(textMat);
      }
    });

    logoGroup.add(textScene);
  }, undefined, (err) => {
    console.error('[LogoScene] Failed to load interstellar_text.glb:', err);
  });

  return {
    group: logoGroup,
    update(t) {
      if (logoGroup.children.length > 0) {
        logoGroup.rotation.y = Math.sin(t * 0.4) * 0.08;
      }
      for (const mat of animatedMaterials) {
        mat.uniforms.uTime.value = t;
      }
    }
  };
}
