import * as THREE from 'three';

export function createIridescentMaterial() {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    depthTest: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime:     { value: 0 },
      uOpacity:  { value: 1.0 },
      uColor1:   { value: new THREE.Color('#2e1264') },
      uColor2:   { value: new THREE.Color('#9b07c3') },
      uColor3:   { value: new THREE.Color('#c103e5') },
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
        float fresnel = pow(1.0 - NdotV, 2.5);

        float t = sin(uTime * 0.8 + vWorldPos.y * 0.5 + vUv.x * 4.0) * 0.5 + 0.5;
        vec3 baseColor = mix(uColor1, uColor2, t);
        baseColor = mix(baseColor, uColor3, fresnel);

        // Metallic studio light
        vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
        float diff = max(dot(N, L), 0.0) * 0.7 + 0.3;
        vec3 H = normalize(L + V);
        float spec = pow(max(dot(N, H), 0.0), 90.0) * 1.5;

        vec3 finalCol = baseColor * diff + vec3(0.8, 0.4, 1.0) * spec + vec3(0.5, 0.1, 0.8) * fresnel;

        gl_FragColor = vec4(clamp(finalCol, 0.0, 1.0), uOpacity);
      }
    `
  });
  return mat;
}
