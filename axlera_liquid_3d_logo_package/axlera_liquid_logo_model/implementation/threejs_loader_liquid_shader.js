
// Three.js / React Three Fiber style implementation notes
// Load models/axlera_liquid_logo.glb and replace its material with a premium liquid shader.

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const loader = new GLTFLoader();
loader.load('/models/axlera_liquid_logo.glb', (gltf) => {
  const logo = gltf.scene;
  logo.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeVertexNormals();
      child.material = createHeavyLiquidMaterial();
    }
  });
  logo.position.set(0, 0, 0);
  logo.rotation.set(0.12, -0.24, 0.02);
  logo.scale.setScalar(1.25);
  scene.add(logo);
});

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
    vertexColors: true
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
         // upper-left to right stream
         f += flowLine(p, vec2(-1.65, 0.52), vec2(-0.35, 0.03), 0.075) * (0.55 + 0.45*sin(t + p.x*5.0));
         f += flowLine(p, vec2(-0.35, 0.03), vec2(1.55, 0.28), 0.075) * (0.55 + 0.45*sin(t*1.1 + p.x*4.0));
         // center downward then curling to the right stream
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

  material.tick = (time) => {
    if (material.userData.shader) material.userData.shader.uniforms.uTime.value = time;
  };

  return material;
}

// In your animation loop:
// logoMaterial.tick(clock.getElapsedTime())
// Rotate very slowly: logo.rotation.y += 0.002
// Use bloom strength 0.35-0.65 and subtle chromatic aberration only.
