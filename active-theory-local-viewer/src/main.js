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
{ p: 0.00, cam: new THREE.Vector3( 0.3,  4.2,  4.2), target: new THREE.Vector3(0.50,  3.6, -0.5) },
{ p: 0.25, cam: new THREE.Vector3( 0.1,  2.0,  3.8), target: new THREE.Vector3(0.60,  1.8, -0.6) },
{ p: 0.50, cam: new THREE.Vector3( 0.4,  0.0,  3.6), target: new THREE.Vector3(0.60,  0.0, -0.6) },
{ p: 0.75, cam: new THREE.Vector3( 0.2, -2.0,  3.8), target: new THREE.Vector3(0.55, -2.0, -0.6) },
{ p: 1.00, cam: new THREE.Vector3( 0.3, -4.0,  4.2), target: new THREE.Vector3(0.45, -4.2, -0.6) },
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

smoothScroll += (scrollProgress - smoothScroll) * 0.075;

const section = getScrollSection(smoothScroll);
updateActiveMenuItem(section);

if (thumb) {
thumb.style.top = `${smoothScroll * 60}px`;
}

const { cam, target } = lerpPath(smoothScroll);
cam.x += mouse.x * 0.18;
cam.y += mouse.y * 0.08;

camera.position.lerp(cam, 0.12);
const lookTarget = new THREE.Vector3();
lookTarget.copy(target);
lookTarget.x += mouse.x * 0.05;
camera.lookAt(lookTarget);

if (bgMesh) {
bgMesh.position.y = camera.position.y;
}

if (logoGroup && logoObj) {
logoObj.update(t);

const logoT = Math.min(1.0, smoothScroll / 0.20);

logoGroup.position.set(
0.12 + mouse.x * 0.14,
3.6 + logoT * 6.0 + mouse.y * 0.10,
-0.5
);

logoGroup.scale.setScalar(0.75 * (1.0 - logoT * 0.45));

logoGroup.rotation.y = 0.05 + mouse.x * 0.15;
logoGroup.rotation.x = -0.12 - mouse.y * 0.08;

logoGroup.visible = (logoT < 0.99);
}

if (cardsGroup) {
const isScrolledPastHero = (smoothScroll > 0.05);
cardsGroup.visible = isScrolledPastHero;

cardsGroup.children.forEach((cardGroup) => {
const data = cardGroup.userData;
// Section target scroll: Section 0 at 0.12, Section 1 at 0.30, etc.
const targetScroll = 0.12 + data.section * 0.18;
const rel = (smoothScroll - targetScroll) / 0.18;

// 3D Motion Path (Bottom-Right -> Center -> Top-Left)
const camY = camera.position.y;
const camZ = camera.position.z;

const targetX = -2.4 * rel + mouse.x * 0.10;
const targetY = camY - 2.0 * rel + mouse.y * 0.08;
const targetZ = camZ - 2.4 - 1.8 * (rel * rel);

cardGroup.position.set(targetX, targetY, targetZ);

// Rotation Y:
// rel < 0 (bottom-right): facing right (-0.55 rad)
// rel = 0 (center): facing us directly (0.0 rad)
// rel > 0 (top-left): facing left (+0.55 rad)
const targetRotY = Math.max(-0.58, Math.min(0.58, rel * 0.70));
cardGroup.rotation.y = targetRotY;

// Opacity
const activeOpacity = Math.max(0.0, 1.0 - Math.pow(Math.abs(rel), 1.6));
cardGroup.children.forEach((child) => {
if (child.material) {
child.material.opacity = (child.material.map ? 0.98 : 0.82) * activeOpacity;
}
});
});
}

if (spineGroup) {
const isScrolledPastHero = (smoothScroll > 0.05);
spineGroup.visible = isScrolledPastHero;

const currentSection = getScrollSection(smoothScroll);

spineGroup.children.forEach((mesh, idx) => {
if (mesh.material) {
if (mesh.material.uniforms) {
if (mesh.material.uniforms.uOpacity) mesh.material.uniforms.uOpacity.value = 1.0;
if (mesh.material.uniforms.uTime) mesh.material.uniforms.uTime.value = t;
}
mesh.material.visible = isScrolledPastHero;
}

const baseAngle = idx * 0.40;
const cardIdxMap = [4, 12, 20, 28, 36];
const targetSegment = cardIdxMap[currentSection] || 4;

const segmentDist = Math.abs(idx - targetSegment);
let scrollRotationOffset = 0;
if (segmentDist <= 3 && isScrolledPastHero) {
const turnFactor = Math.max(0, 1.0 - segmentDist * 0.25);
scrollRotationOffset = (currentSection % 2 === 0 ? -0.45 : 0.45) * turnFactor;
}

mesh.rotation.y = baseAngle + scrollRotationOffset;
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

