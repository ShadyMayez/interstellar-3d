import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { loadDracoDecoder, initDraco } from './binViewer.js';
import { loadSpineMesh } from './scene/SpineScene.js';
import { createLogoMesh } from './scene/LogoScene.js';
import { createParticles } from './scene/createParticles.js';
import { createGlassCards } from './scene/createGlassCards.js';
import { setupPostprocessing } from './postprocessing.js';

/* ──────────────────────────────────────────────
State
────────────────────────────────────────────── */
let scene, camera, renderer, postprocessing;
let logoGroup, logoObj, spineGroup, particleGroup, cardsGroup, bgMesh;
const clock = new THREE.Clock();

// Scroll
let scrollProgress = 0;   // raw 0-1
let smoothScroll   = 0;   // damped 0-1

// Mouse
const mouse = { x: 0, y: 0 };

/* ──────────────────────────────────────────────
Camera path keyframes
────────────────────────────────────────────── */
const cameraPath = [
  { p: 0.00, cam: new THREE.Vector3(0.0,  3.6,  4.2), target: new THREE.Vector3(0.0,  3.6, -0.5) },
  { p: 0.25, cam: new THREE.Vector3(0.0,  0.8,  3.8), target: new THREE.Vector3(0.0,  0.8, -0.6) },
  { p: 0.50, cam: new THREE.Vector3(0.0, -2.0,  3.6), target: new THREE.Vector3(0.0, -2.0, -0.6) },
  { p: 0.75, cam: new THREE.Vector3(0.0, -4.8,  3.8), target: new THREE.Vector3(0.0, -4.8, -0.6) },
  { p: 1.00, cam: new THREE.Vector3(0.0, -7.6,  4.2), target: new THREE.Vector3(0.0, -7.6, -0.6) },
];

function lerpPath(progress) {
  const t = Math.max(0, Math.min(1, progress));

  let a = cameraPath[0], b = cameraPath[cameraPath.length - 1];
  for (let i = 0; i < cameraPath.length - 1; i++) {
    if (t >= cameraPath[i].p && t <= cameraPath[i + 1].p) {
      a = cameraPath[i];
      b = cameraPath[i + 1];
      break;
    }
  }

  const segLen = b.p - a.p;
  const f = segLen > 0 ? (t - a.p) / segLen : 0;

  return {
    cam:    new THREE.Vector3().lerpVectors(a.cam, b.cam, f),
    target: new THREE.Vector3().lerpVectors(a.target, b.target, f),
  };
}

/* ──────────────────────────────────────────────
Section helper
────────────────────────────────────────────── */
function getScrollSection(progress) {
if (progress < 0.20) return 0;
if (progress < 0.40) return 1;
if (progress < 0.60) return 2;
if (progress < 0.80) return 3;
return 4;
}

function updateActiveMenuItem(section) {
document.querySelectorAll('.menu-item').forEach((el) => {
const s = parseInt(el.dataset.section, 10);
el.classList.toggle('active', s === section);
});
}

/* ──────────────────────────────────────────────
Init
────────────────────────────────────────────── */
async function init() {
const canvas = document.getElementById('three-canvas');

scene = new THREE.Scene();
scene.background = new THREE.Color('#f8f9fa');
scene.fog = new THREE.FogExp2('#e9ecef', 0.045);

camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 80);
camera.position.set(0.2, 4.2, 7.0);
camera.layers.enable(1);

renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

// Background plane with radial gradient
const bgGeom = new THREE.PlaneGeometry(100, 100);
const bgMat = new THREE.ShaderMaterial({
depthWrite: false,
depthTest: true,
uniforms: {
uColorSide:   { value: new THREE.Color('#e9ecef') },
uColorCenter: { value: new THREE.Color('#ffffff') },
},
vertexShader: `
varying vec2 vUv;
void main() {
vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
fragmentShader: `
varying vec2 vUv;
uniform vec3 uColorSide;
uniform vec3 uColorCenter;
void main() {
float distToCenter = length(vUv - 0.5) * 1.414;
float t = smoothstep(0.0, 1.0, distToCenter);
vec3 finalCol = mix(uColorCenter, uColorSide, t);
gl_FragColor = vec4(finalCol, 1.0);
}
`
});
bgMesh = new THREE.Mesh(bgGeom, bgMat);
bgMesh.renderOrder = -100;
bgMesh.position.set(0.5, 4.2, -15);
scene.add(bgMesh);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.15));

const pointLightLeft = new THREE.PointLight(0xffffff, 25, 9, 2.0);
pointLightLeft.position.set(-3.4, 0.2, 2.4);
scene.add(pointLightLeft);

const pointLightRight = new THREE.PointLight(0xffffff, 30, 9, 2.0);
pointLightRight.position.set(3.25, -0.25, 2.8);
scene.add(pointLightRight);

const backLight = new THREE.PointLight(0xffffff, 20, 8, 2.0);
backLight.position.set(0.2, 1.8, -3.5);
scene.add(backLight);

const topWhiteHighlight = new THREE.DirectionalLight(0xffffff, 0.60);
topWhiteHighlight.position.set(-2, 4, 3);
scene.add(topWhiteHighlight);

// Load Draco
let dracoInstance = null;
try {
const mod = await loadDracoDecoder();
dracoInstance = await initDraco(mod);
console.log('[Main] Draco ready');
} catch (e) {
console.warn('[Main] Draco unavailable, using procedural fallbacks:', e);
}

// Build Scene
logoObj = createLogoMesh();
logoGroup = logoObj.group;
scene.add(logoGroup);

spineGroup = await loadSpineMesh(dracoInstance);
scene.add(spineGroup);

particleGroup = await createParticles(dracoInstance);
scene.add(particleGroup);

cardsGroup = createGlassCards();
scene.add(cardsGroup);

postprocessing = setupPostprocessing(renderer, scene, camera);

// Events
window.addEventListener('resize', onResize);
window.addEventListener('mousemove', onMouse);
window.addEventListener('scroll', onScroll, { passive: true });

onScroll();
updateActiveMenuItem(0);

const thumb = document.getElementById('scroll-thumb');

// Animate
function animate() {
requestAnimationFrame(animate);
const t = clock.getElapsedTime();

  smoothScroll += (scrollProgress - smoothScroll) * 0.038;

  const section = getScrollSection(smoothScroll);
  updateActiveMenuItem(section);

  if (thumb) {
    thumb.style.top = `${smoothScroll * 60}px`;
  }

  const { cam, target } = lerpPath(smoothScroll);

  camera.position.lerp(cam, 0.06);
  camera.lookAt(target);

  if (bgMesh) {
    bgMesh.position.y = camera.position.y;
  }

  if (logoGroup && logoObj) {
    logoObj.update(t);

    const logoT = Math.min(1.0, smoothScroll / 0.20);

    logoGroup.position.set(
      0.12,
      3.6 + logoT * 6.0,
      -0.5
    );

    logoGroup.scale.setScalar(0.75 * (1.0 - logoT * 0.45));

    logoGroup.rotation.y = 0.05;
    logoGroup.rotation.x = -0.12;

    logoGroup.visible = (logoT < 0.99);
  }

  if (cardsGroup) {
    const isScrolledPastHero = (smoothScroll > 0.05);
    cardsGroup.visible = isScrolledPastHero;

    const camY = camera.position.y;
    const camZ = camera.position.z;
    const orbitRadius = 2.4;
    const cardCount = cardsGroup.children.length;
    const scrollStep = 0.88 / Math.max(1, cardCount - 1);

    cardsGroup.children.forEach((cardGroup) => {
      const data = cardGroup.userData;
      const i = data.section;

      // Target scroll for card i to be active in the exact center of the website
      const cardTargetScroll = 0.10 + i * scrollStep;
      const rel = (smoothScroll - cardTargetScroll) / scrollStep;

      // Smooth cylinder orbit angle theta (sweet spot spacing)
      const theta = rel * 0.82;

      // Exact horizontal center of website when active (X = 0.0)
      const targetX = orbitRadius * Math.sin(theta);

      // Sweet spot vertical spacing (1.6 units) - Cards stay close without overlapping!
      const targetY = camY + (rel * 1.6);
      const targetZ = (camZ - 2.2) - orbitRadius * (1.0 - Math.cos(theta));

      // Tangent outward normal rotation (0.0 when active)
      const targetRotY = theta;

      // Opacity highest when facing front center
      const facingFactor = Math.cos(theta);
      const opacity = Math.max(0.0, Math.min(1.0, (facingFactor - 0.10) / 0.90));

      cardGroup.position.set(targetX, targetY, targetZ);
      cardGroup.rotation.y = targetRotY;

      cardGroup.children.forEach((child) => {
        if (child.material) {
          child.material.opacity = (child.material.map ? 0.98 : 0.82) * opacity;
        }
      });
    });
  }

if (spineGroup) {
const isScrolledPastHero = (smoothScroll > 0.05);
spineGroup.visible = isScrolledPastHero;

spineGroup.children.forEach((mesh, idx) => {
if (mesh.material) {
if (mesh.material.uniforms) {
if (mesh.material.uniforms.uOpacity) mesh.material.uniforms.uOpacity.value = 1.0;
if (mesh.material.uniforms.uTime) mesh.material.uniforms.uTime.value = t;
}
mesh.material.visible = isScrolledPastHero;
}

// Shifted spiral twist angle offset (0.35 + idx * 0.95) - Creates dynamic illusion of fast backbone rotation on scroll!
mesh.rotation.y = 0.35 + idx * 0.95;
});
}

if (particleGroup) {
particleGroup.children.forEach((pts) => {
const s = pts.userData.speed || 0.015;
pts.rotation.y += s * 0.02;

if (pts.userData.customShader) {
pts.userData.customShader.uniforms.uTime.value = t;
}
});
}

postprocessing.update(t);
postprocessing.composer.render();
}

animate();
}

function onResize() {
camera.aspect = innerWidth / innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(innerWidth, innerHeight);
postprocessing.resize(innerWidth, innerHeight);
}

function onMouse(e) {
mouse.x = (e.clientX / innerWidth) * 2 - 1;
mouse.y = -(e.clientY / innerHeight) * 2 + 1;
}

function onScroll() {
const total = document.body.scrollHeight - window.innerHeight;
scrollProgress = total > 0 ? window.scrollY / total : 0;
}

window.addEventListener('DOMContentLoaded', init);

