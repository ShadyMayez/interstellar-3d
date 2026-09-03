import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

function createHeavyLiquidMaterial() {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#12002e'),
    metalness: 0.03,
    roughness: 0.18,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    transmission: 0.15,
    thickness: 0.9,
    ior: 1.48,
    envMapIntensity: 1.6,
    vertexColors: true,
    side: THREE.DoubleSide
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = { value: 0 };
    shader.uniforms.uFlowStrength = { value: 0.9 };

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
       varying vec3 vWorldPos;
       varying vec3 vObjPos;
       varying vec3 vNormalFlow;`
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
       vWorldPos = worldPosition.xyz;
       vObjPos = position;
       vNormalFlow = normal;`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
       uniform float uTime;
       uniform float uFlowStrength;
       varying vec3 vWorldPos;
       varying vec3 vObjPos;
       varying vec3 vNormalFlow;

       float flowLine(vec2 p, vec2 a, vec2 b, float width) {
         vec2 pa = p - a;
         vec2 ba = b - a;
         float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
         float d = length(pa - ba * h);
         return exp(-(d * d) / (2.0 * width * width));
       }

       float liquidFlow(vec2 p, float t) {
         float f = 0.0;
         f += flowLine(p, vec2(-1.65, 0.52), vec2(-0.35, 0.03), 0.075) * (0.55 + 0.45*sin(t + p.x*5.0));
         f += flowLine(p, vec2(-0.35, 0.03), vec2(1.55, 0.28), 0.075) * (0.55 + 0.45*sin(t*1.1 + p.x*4.0));
         f += flowLine(p, vec2(-0.62,-0.35), vec2(0.02,-1.25), 0.09) * (0.55 + 0.45*sin(t*1.2 + p.y*6.0));
         f += flowLine(p, vec2(0.02,-1.25), vec2(1.35, 0.06), 0.095) * (0.55 + 0.45*sin(t*1.3 + p.x*5.0));
         return clamp(f, 0.0, 1.0);
       }`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `#include <color_fragment>
       vec2 p = vObjPos.xy;
       float flow = liquidFlow(p, uTime * 0.9) * uFlowStrength;
       vec3 deepNavy = vec3(0.005, 0.02, 0.11);
       vec3 electricBlue = vec3(0.0, 0.22, 1.0);
       vec3 violet = vec3(0.45, 0.02, 1.0);
       vec3 magenta = vec3(1.0, 0.0, 0.92);
       vec3 hotWhite = vec3(1.0, 0.83, 1.0);
       float xGrad = smoothstep(-1.8, 1.8, p.x);
       vec3 liquidBase = mix(deepNavy, magenta, xGrad);
       vec3 flowColor = mix(electricBlue, hotWhite, smoothstep(0.35, 0.95, flow));
       diffuseColor.rgb = mix(diffuseColor.rgb * liquidBase * 1.45, flowColor, flow * 0.55);
       diffuseColor.rgb += violet * pow(max(dot(normalize(vNormalFlow), normalize(vec3(-0.4,0.8,0.6))), 0.0), 3.0) * 0.35;`
    );

    material.userData.shader = shader;
  };

  return material;
}

export function createLogoMesh() {
  const logoGroup = new THREE.Group();
  const animatedMaterials = [];

  const loader = new GLTFLoader();

  // Load Axlera Heavy Liquid 3D Logo GLB with MeshPhysicalMaterial glassy transmission shell
  loader.load('/models/axlera_liquid_logo.glb', (gltf) => {
    const logoMeshGroup = gltf.scene;
    logoMeshGroup.scale.setScalar(1.6);
    logoMeshGroup.position.set(-2.0, 0.0, 0.0);

    const liquidMat = createHeavyLiquidMaterial();
    animatedMaterials.push(liquidMat);

    logoMeshGroup.traverse((child) => {
      if (child.isMesh) {
        child.geometry.computeVertexNormals();
        child.material = liquidMat;
      }
    });

    logoGroup.add(logoMeshGroup);
    console.log('[LogoScene] Loaded axlera_liquid_logo.glb with heavy liquid glass material');
  }, undefined, (err) => {
    console.error('[LogoScene] Failed to load axlera_liquid_logo.glb:', err);
  });

  // Load 3D Text Mesh (Interstellar with custom 3D swollen 'a')
  loader.load('/assets/geometry/interstellar_text.glb', (gltf) => {
    const textScene = gltf.scene;

    const bbox = new THREE.Box3().setFromObject(textScene);
    const center = bbox.getCenter(new THREE.Vector3());

    textScene.scale.setScalar(0.75);
    textScene.position.set(-center.x * 0.75 + 1.0, 0.0, -center.z * 0.75);

    textScene.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#03163e'),
          roughness: 0.20,
          metalness: 0.10,
          side: THREE.FrontSide,
        });
      }
    });

    logoGroup.add(textScene);
    console.log('[LogoScene] Loaded interstellar_text.glb successfully');
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
        if (mat.userData && mat.userData.shader && mat.userData.shader.uniforms && mat.userData.shader.uniforms.uTime) {
          mat.userData.shader.uniforms.uTime.value = t;
        }
      }
    }
  };
}
