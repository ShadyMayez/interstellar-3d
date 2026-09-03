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
return targetMin + norm * (targetMax - targetMin);
}

float hash31(vec3 p) {
p = fract(p * 0.1031);
p += dot(p, p.yzx + 33.33);
return fract((p.x + p.y) * p.z);
}

float noise3d(vec3 p) {
vec3 i = floor(p), f = fract(p);
f = f * f * (3.0 - 2.0 * f);
float n000 = hash31(i + vec3(0,0,0));
float n100 = hash31(i + vec3(1,0,0));
float n010 = hash31(i + vec3(0,1,0));
float n110 = hash31(i + vec3(1,1,0));
float n001 = hash31(i + vec3(0,0,1));
float n101 = hash31(i + vec3(1,0,1));
float n011 = hash31(i + vec3(0,1,0));
float n111 = hash31(i + vec3(1,1,1));
return mix(mix(mix(n000,n100,f.x),mix(n010,n110,f.x),f.y),
mix(mix(n001,n101,f.x),mix(n011,n111,f.x),f.y),f.z);
}

float fbm(vec3 p) {
float v = 0.0;
float a = 0.5;
vec3 shift = vec3(100.0);
for (int i = 0; i < 4; i++) {
v += a * noise3d(p);
p = p * 2.04 + shift;
a *= 0.5;
}
return v;
}

vec3 getRampColor(float f) {
f = clamp(f, 0.0, 1.0);

vec3 c0  = vec3(0.0118, 0.0863, 0.2431); // #03163e (Dark Navy Node)
vec3 c1  = vec3(0.1882, 0.0667, 0.3961); // #301165
vec3 c2  = vec3(0.3255, 0.0549, 0.5176); // #530e84
vec3 c3  = vec3(0.4549, 0.0431, 0.6314); // #740ba1
vec3 c4  = vec3(0.6078, 0.0275, 0.7647); // #9b07c3
vec3 c5  = vec3(0.6588, 0.0196, 0.8118); // #a805cf
vec3 c6  = vec3(0.7569, 0.0118, 0.8980); // #c103e5 (PEAK BRIGHT MAGENTA)
vec3 c7  = vec3(0.3961, 0.0471, 0.5804); // #650c94
vec3 c8  = vec3(0.2510, 0.0627, 0.4510); // #401073
vec3 c9  = vec3(0.1804, 0.0706, 0.3922); // #2e1264
vec3 c10 = vec3(0.0118, 0.0863, 0.2431); // #03163e

if (f < 0.10) return mix(c0, c1, f / 0.10);
if (f < 0.20) return mix(c1, c2, (f - 0.10) / 0.10);
if (f < 0.30) return mix(c2, c3, (f - 0.20) / 0.10);
if (f < 0.40) return mix(c3, c4, (f - 0.30) / 0.10);
if (f < 0.48) return mix(c4, c5, (f - 0.40) / 0.08);
if (f < 0.52) return mix(c5, c6, (f - 0.48) / 0.04);
if (f < 0.65) return mix(c6, c7, (f - 0.52) / 0.13);
if (f < 0.78) return mix(c7, c8, (f - 0.65) / 0.13);
if (f < 0.90) return mix(c8, c9, (f - 0.78) / 0.12);
return mix(c9, c10, (f - 0.90) / 0.10);
}

void main() {
vec3 p = getMappedPos(vObjectPosition);
float t = uTime * 0.35;

vec3 V = normalize(cameraPosition - vWorldPosition);
vec3 N = normalize(vNormalW);
float NdotV = abs(dot(N, V));

float dTopLeft = length(vec2(p.x - (-0.95), p.y - 0.75));
float darkBigNodeMask = smoothstep(1.30, 0.40, dTopLeft);

float darkEdge1 = smoothstep(0.35, 1.20, p.x) * smoothstep(-0.5, 0.7, p.y);

float dBottomEdge = length(vec2(p.x - 0.05, p.y - (-1.25)));
float darkEdge2 = smoothstep(0.75, 0.15, dBottomEdge);

float flowTime = uTime * 0.7;
vec3 flowP = p * 1.6 + vec3(sin(flowTime * 0.5) * 0.5, flowTime * 0.4, cos(flowTime * 0.5) * 0.5);

vec3 q = vec3(fbm(flowP + vec3(0.0, 0.0, 0.0)),
fbm(flowP + vec3(5.2, 1.3, 0.0)),
fbm(flowP + vec3(1.7, 2.8, 0.0)));

vec3 r = vec3(fbm(flowP + 3.0 * q + vec3(1.7, 0.4, flowTime * 0.2)),
fbm(flowP + 3.0 * q + vec3(8.3, 2.8, flowTime * 0.15)),
fbm(flowP + 3.0 * q + vec3(3.2, 1.1, flowTime * 0.25)));

float fluidSmoke = fbm(flowP + 2.5 * r);

float distCenterBridge = length(vec2(p.x - 0.20, p.y - 0.10));
float peakFactor = exp(-distCenterBridge * distCenterBridge * 3.5);

float ribbonPos = smoothstep(-0.8, 0.6, p.x);
float rampT = mix(ribbonPos * 0.5, 0.50, peakFactor);

rampT += (fluidSmoke - 0.5) * 0.45;
rampT = clamp(rampT, 0.05, 0.95);

vec3 colorLiquid = getRampColor(rampT);
vec3 darkNavy = vec3(0.0118, 0.0863, 0.2431); // #03163e

float totalDarkMask = clamp(darkBigNodeMask + darkEdge1 * 0.90 + darkEdge2 * 0.90, 0.0, 1.0);

vec3 baseColor = mix(colorLiquid, darkNavy, totalDarkMask);

// Studio Lighting
vec3 keyLightDir = normalize(vec3(-0.4, 0.85, 0.75));
vec3 fillLightDir = normalize(vec3(0.6, -0.3, 0.5));
float NdotL1 = max(dot(N, keyLightDir), 0.0);
float NdotL2 = max(dot(N, fillLightDir), 0.0);

float studioLight = NdotL1 * 0.65 + NdotL2 * 0.25 + 0.25;
vec3 shadedColor = baseColor * studioLight;

// Rich Tinted Specular (Deep magenta/purple glint - strictly no white)
vec3 H1 = normalize(keyLightDir + V);
float specSharp = pow(max(dot(N, H1), 0.0), 120.0);
float specBroad = pow(max(dot(N, H1), 0.0), 20.0);
vec3 specular = vec3(0.40, 0.05, 0.50) * specSharp * 0.8 + vec3(0.20, 0.02, 0.30) * specBroad * 0.15;

vec3 R = reflect(-V, N);
float studioRefl = pow(max(dot(R, normalize(vec3(-0.35, 0.75, 0.55))), 0.0), 10.0);
specular += vec3(0.25, 0.02, 0.35) * studioRefl * 0.20;

// Smooth Dark Violet Silhouette Rim (No white edge fringes)
float fresnel = pow(1.0 - NdotV, 4.0);
vec3 purpleRim = vec3(0.25, 0.02, 0.35);
vec3 darkRim = vec3(0.01, 0.03, 0.12);

vec3 rimColor = mix(purpleRim, darkRim, darkBigNodeMask);
vec3 glassRim = rimColor * fresnel * 0.25;

float dHoleCenter = length(vec2(p.x - 0.10, p.y + 0.35));
float holeAO = smoothstep(0.08, 0.38, dHoleCenter);
shadedColor *= mix(0.55, 1.0, holeAO);

vec3 finalColor = shadedColor + specular + glassRim;
gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
});
}

function makeMasterTextMaterial(geometry) {
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

vec3 getRampColor(float f) {
f = clamp(f, 0.0, 1.0);
vec3 c0  = vec3(0.0118, 0.0863, 0.2431); // #03163e
vec3 c1  = vec3(0.1882, 0.0667, 0.3961); // #301165
vec3 c2  = vec3(0.3255, 0.0549, 0.5176); // #530e84
vec3 c3  = vec3(0.4549, 0.0431, 0.6314); // #740ba1
vec3 c4  = vec3(0.6078, 0.0275, 0.7647); // #9b07c3
vec3 c5  = vec3(0.6588, 0.0196, 0.8118); // #a805cf
vec3 c6  = vec3(0.7569, 0.0118, 0.8980); // #c103e5 (PEAK BRIGHT MAGENTA)
vec3 c7  = vec3(0.3961, 0.0471, 0.5804); // #650c94
vec3 c8  = vec3(0.2510, 0.0627, 0.4510); // #401073
vec3 c9  = vec3(0.1804, 0.0706, 0.3922); // #2e1264
vec3 c10 = vec3(0.0118, 0.0863, 0.2431); // #03163e

if (f < 0.10) return mix(c0, c1, f / 0.10);
if (f < 0.20) return mix(c1, c2, (f - 0.10) / 0.10);
if (f < 0.30) return mix(c2, c3, (f - 0.20) / 0.10);
if (f < 0.40) return mix(c3, c4, (f - 0.30) / 0.10);
if (f < 0.48) return mix(c4, c5, (f - 0.40) / 0.08);
if (f < 0.52) return mix(c5, c6, (f - 0.48) / 0.04);
if (f < 0.65) return mix(c6, c7, (f - 0.52) / 0.13);
if (f < 0.78) return mix(c7, c8, (f - 0.65) / 0.13);
if (f < 0.90) return mix(c8, c9, (f - 0.78) / 0.12);
return mix(c9, c10, (f - 0.90) / 0.10);
}

void main() {
// Normalized position along the text bounding box (0.0 at 'I', 1.0 at 'r')
float xNorm = (vObjectPosition.x - uMin.x) / (uMax.x - uMin.x + 1e-5);
float yNorm = (vObjectPosition.y - uMin.y) / (uMax.y - uMin.y + 1e-5);

vec3 V = normalize(cameraPosition - vWorldPosition);
vec3 N = normalize(vNormalW);
float NdotV = abs(dot(N, V));

// Letter 'a' Mask (11th character in Interstellar): located around xNorm ~ 0.76 to 0.88
float isLetterA = smoothstep(0.76, 0.79, xNorm) * (1.0 - smoothstep(0.87, 0.90, xNorm));

// Top-right curve of letter 'a' has the glowing magenta/purple liquid gradient matching THUSA.png
float aGradient = smoothstep(0.10, 0.90, (xNorm - 0.76) / 0.11 + (yNorm - 0.25) * 0.9);
aGradient = clamp(aGradient, 0.0, 1.0);

vec3 darkObsidian = vec3(0.42, 0.08, 0.65); // Vibrant rich metallic purple #6b14a6!
vec3 brightLiquid = getRampColor(mix(0.35, 0.55, aGradient)); // Glowing magenta liquid #d900ff!

// All letters are vibrant metallic purple with letter 'a' top-right liquid gradient!
vec3 baseColor = mix(darkObsidian, brightLiquid, isLetterA * aGradient * 0.98);

// Studio Lighting
vec3 keyLightDir = normalize(vec3(-0.4, 0.85, 0.75));
vec3 fillLightDir = normalize(vec3(0.6, -0.3, 0.5));
float NdotL1 = max(dot(N, keyLightDir), 0.0);
float NdotL2 = max(dot(N, fillLightDir), 0.0);

float studioLight = NdotL1 * 0.75 + NdotL2 * 0.35 + 0.35;
vec3 shadedColor = baseColor * studioLight;

// Specular Clearcoat Wet Glint
vec3 H1 = normalize(keyLightDir + V);
float specSharp = pow(max(dot(N, H1), 0.0), 160.0);
float specBroad = pow(max(dot(N, H1), 0.0), 22.0);
vec3 specular = vec3(1.0) * (specSharp * 1.8 + specBroad * 0.35);

// Studio Box Reflection
vec3 R = reflect(-V, N);
float studioRefl = pow(max(dot(R, normalize(vec3(-0.35, 0.75, 0.55))), 0.0), 10.0);
specular += vec3(0.95, 0.98, 1.0) * studioRefl * 0.65;

// Fresnel Glass Rim
float fresnel = pow(1.0 - NdotV, 3.2);
vec3 rimColor = mix(vec3(0.85, 0.60, 0.98), vec3(0.95, 0.20, 0.98), isLetterA * 0.85);
vec3 glassRim = rimColor * fresnel * 0.95;

vec3 finalColor = shadedColor + specular + glassRim;
gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
}
`
});
}

export function createLogoMesh() {
  const logoGroup = new THREE.Group();
  const animatedMaterials = [];

  const textureLoader = new THREE.TextureLoader();

  // Load User's Custom Logo Mark Image Texture (/public/images/logo_mark.png)
  textureLoader.load('/images/logo_mark.png', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // 1:1 Aspect ratio square plane (1.8 x 1.8 units)
    const logoGeom = new THREE.PlaneGeometry(1.8, 1.8);
    const logoMat = new THREE.MeshBasicMaterial({
      map: texture,
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const logoMesh = new THREE.Mesh(logoGeom, logoMat);
    logoMesh.position.set(-2.2, 0.0, 0.0);
    logoGroup.add(logoMesh);

    console.log('[LogoScene] Loaded logo_mark.png texture successfully!');
  }, undefined, (err) => {
    console.error('[LogoScene] Failed to load logo_mark.png:', err);
  });

  // Load THUSA Image Texture to replace 3D Interstellar text model
  textureLoader.load('/images/THUSA-removebg-preview.png', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Aspect ratio 3.007 (866x288) -> 4.5 x 1.5 units plane
    const planeGeom = new THREE.PlaneGeometry(4.5, 1.5);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const thusaMesh = new THREE.Mesh(planeGeom, planeMat);
    thusaMesh.position.set(0.70, 0.45, 0.0);
    logoGroup.add(thusaMesh);

    console.log('[LogoScene] Loaded THUSA-removebg-preview.png texture successfully!');
  }, undefined, (err) => {
    console.error('[LogoScene] Failed to load THUSA-removebg-preview.png:', err);
  });

  // Load Consultation Service Subtitle Image Texture (/public/images/subtitle_text.png)
  textureLoader.load('/images/subtitle_text.png', (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Aspect ratio 1.776 (666x375) -> 3.5 x 1.97 units plane
    const subGeom = new THREE.PlaneGeometry(3.6, 2.0);
    const subMat = new THREE.MeshBasicMaterial({
      map: texture,
      color: new THREE.Color('#ffffff'),
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    const subMesh = new THREE.Mesh(subGeom, subMat);
    subMesh.position.set(0.70, -0.55, 0.0);
    logoGroup.add(subMesh);

    console.log('[LogoScene] Loaded subtitle_text.png texture successfully!');
  }, undefined, (err) => {
    console.error('[LogoScene] Failed to load subtitle_text.png:', err);
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

