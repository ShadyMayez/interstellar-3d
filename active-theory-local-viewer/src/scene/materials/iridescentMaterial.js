import * as THREE from 'three';

export function createIridescentMaterial() {
  const mat = new THREE.ShaderMaterial({
    transparent: false,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime:     { value: 0 },
      uOpacity:  { value: 1.0 },
      uColor1:   { value: new THREE.Color('#12052b') }, // Dark Obsidian Indigo
      uColor2:   { value: new THREE.Color('#4a0770') }, // Dark Midnight Violet
      uColor3:   { value: new THREE.Color('#73029e') }, // Rich Deep Purple
    },
    vertexShader: /* glsl */`
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 mvPosition = viewMatrix * worldPosition;
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      varying vec3 vWorldNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vec3 N = normalize(vWorldNormal);
        vec3 V = normalize(vViewPosition);
        float NdotV = abs(dot(N, V));

        // Glass Fresnel Edge Rim
        float fresnel = pow(1.0 - NdotV, 3.5);

        float t = sin(uTime * 0.8 + vWorldPos.y * 0.5 + vUv.x * 4.0) * 0.5 + 0.5;
        vec3 baseColor = mix(uColor1, uColor2, t);
        baseColor = mix(baseColor, uColor3, fresnel * 0.7);

        // Dark Studio Lighting
        vec3 L = normalize(vec3(-0.4, 0.85, 0.75));
        vec3 Lfill = normalize(vec3(0.6, -0.3, 0.5));
        float diffKey = max(dot(N, L), 0.0) * 0.50;
        float diffFill = max(dot(N, Lfill), 0.0) * 0.20;
        float studioLight = diffKey + diffFill + 0.25;
        vec3 shadedColor = baseColor * studioLight;

        // High-Gloss Glassy Specular Shine (Sharp Clearcoat + Broad Sheen)
        vec3 H = normalize(L + V);
        float specSharp = pow(max(dot(N, H), 0.0), 180.0);
        float specBroad = pow(max(dot(N, H), 0.0), 28.0);
        vec3 specGlint = vec3(0.95, 0.90, 1.0) * specSharp * 2.2 + vec3(0.65, 0.35, 0.90) * specBroad * 0.45;

        // Studio Glass Environment Reflection
        vec3 R = reflect(-V, N);
        float studioRefl = pow(max(dot(R, normalize(vec3(-0.35, 0.75, 0.55))), 0.0), 14.0);
        vec3 glassRefl = vec3(0.90, 0.85, 1.0) * studioRefl * 0.65;

        // Glass Rim Highlight
        vec3 glassRim = vec3(0.85, 0.65, 1.0) * fresnel * 0.70;

        vec3 finalCol = shadedColor + specGlint + glassRefl + glassRim;

        gl_FragColor = vec4(clamp(finalCol, 0.0, 1.0), uOpacity);
      }
    `
  });
  return mat;
}
