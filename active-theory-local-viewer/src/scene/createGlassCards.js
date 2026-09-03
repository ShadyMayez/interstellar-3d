import * as THREE from 'three';

function createCurvyPlaneGeometry(width, height, segmentsX, segmentsY, curveAmount) {
  const geom = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY);
  const pos = geom.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const normX = x / (width * 0.5);
    const zCurve = -Math.pow(normX, 2) * curveAmount;
    pos.setZ(i, zCurve);
  }
  geom.computeVertexNormals();
  return geom;
}

function createCardCanvasTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background Glass Tint gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
  grad.addColorStop(0.5, 'rgba(155, 7, 195, 0.18)');
  grad.addColorStop(1, 'rgba(35, 12, 80, 0.28)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Border outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.50)';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, 1000, 488);

  // Corner Accents
  ctx.fillStyle = '#c103e5';
  ctx.fillRect(12, 12, 40, 8);
  ctx.fillRect(12, 12, 8, 40);
  ctx.fillRect(972, 464, 40, 8);
  ctx.fillRect(1004, 432, 8, 40);

  // Section Index Tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '700 32px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText(data.indexTag, 48, 80);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 68px "NB Architekt Std", system-ui, sans-serif';
  ctx.fillText(data.title, 48, 175);

  // Subtitle / Description
  ctx.fillStyle = 'rgba(240, 240, 255, 0.90)';
  ctx.font = '400 30px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText(data.description, 48, 250);

  // Footer Link CTA
  ctx.fillStyle = '#c103e5';
  ctx.font = '700 32px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText('EXPLORE ->', 48, 430);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export const CARD_DATA_LIST = [
  {
    section: 0,
    segmentIdx: 4,
    indexTag: '01 // PORTFOLIO',
    title: 'WEBSITES',
    description: 'Immersive 3D web applications.',
    offsetX: 0.55,
    offsetZ: 0.20,
    rotationY: -0.35
  },
  {
    section: 1,
    segmentIdx: 12,
    indexTag: '02 // EXPERIENCES',
    title: 'INSTALLATIONS',
    description: 'Spatial audio & digital art.',
    offsetX: -0.55,
    offsetZ: 0.20,
    rotationY: 0.35
  },
  {
    section: 2,
    segmentIdx: 20,
    indexTag: '03 // FUTURE TECH',
    title: 'XR / VR / AI',
    description: 'WebXR & Vision Pro worlds.',
    offsetX: 0.55,
    offsetZ: 0.20,
    rotationY: -0.35
  },
  {
    section: 3,
    segmentIdx: 28,
    indexTag: '04 // CONNECTED',
    title: 'MULTIPLAYER',
    description: 'Realtime 3D multiplayer events.',
    offsetX: -0.55,
    offsetZ: 0.20,
    rotationY: 0.35
  },
  {
    section: 4,
    segmentIdx: 36,
    indexTag: '05 // GAMING',
    title: 'GAMES',
    description: 'High-performance WebGL games.',
    offsetX: 0.55,
    offsetZ: 0.20,
    rotationY: -0.35
  }
];

export function createSingleGlassCard(data) {
  const cardGroup = new THREE.Group();
  cardGroup.name = `Card_${data.section}`;

  // Compact Curvy Glass Backing (Width 1.5, Height 0.8)
  const glassGeom = createCurvyPlaneGeometry(1.5, 0.8, 16, 16, 0.20);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#ffffff'),
    metalness: 0.1,
    roughness: 0.12,
    transmission: 0.88,
    ior: 1.45,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const glassMesh = new THREE.Mesh(glassGeom, glassMat);
  cardGroup.add(glassMesh);

  // Front Text Texture Plane
  const textGeom = createCurvyPlaneGeometry(1.48, 0.78, 16, 16, 0.20);
  const textTexture = createCardCanvasTexture(data);
  const textMat = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const textMesh = new THREE.Mesh(textGeom, textMat);
  textMesh.position.z = 0.02;
  cardGroup.add(textMesh);

  cardGroup.position.set(data.offsetX, 0.0, data.offsetZ);
  cardGroup.rotation.y = data.rotationY;
  cardGroup.userData = data;

  return cardGroup;
}
