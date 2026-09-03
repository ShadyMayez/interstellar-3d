import * as THREE from 'three';

function createCardCanvasTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Glass Tint Background
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, 'rgba(18, 8, 40, 0.82)');
  grad.addColorStop(0.5, 'rgba(75, 12, 125, 0.75)');
  grad.addColorStop(1, 'rgba(135, 5, 175, 0.82)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Border outline & glowing glass rim
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 8;
  ctx.strokeRect(14, 14, 996, 484);

  // Corner Accents
  ctx.fillStyle = '#d900ff';
  ctx.fillRect(14, 14, 44, 8);
  ctx.fillRect(14, 14, 8, 44);
  ctx.fillRect(966, 464, 44, 8);
  ctx.fillRect(1002, 428, 8, 44);

  // Section Index Tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.80)';
  ctx.font = '700 28px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText(data.indexTag, 48, 76);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px "NB Architekt Std", system-ui, sans-serif';
  ctx.fillText(data.title, 48, 160);

  // Subtitle / Description
  ctx.fillStyle = 'rgba(240, 240, 255, 0.90)';
  ctx.font = '400 26px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText(data.description, 48, 230);
  if (data.description2) {
    ctx.fillText(data.description2, 48, 268);
  }

  // Footer Link CTA
  ctx.fillStyle = '#00e5ff';
  ctx.font = '700 28px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText('EXPLORE SECTION ->', 48, 435);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export const CARD_SECTIONS_DATA = [
  {
    section: 0,
    indexTag: '01 // PORTFOLIO',
    title: 'WEBSITES',
    description: 'Award-winning 3D web experiences',
    description2: '& dynamic WebGL applications.'
  },
  {
    section: 1,
    indexTag: '02 // EXPERIENCES',
    title: 'INSTALLATIONS',
    description: 'Interactive physical spaces, digital art',
    description2: '& spatial projection mapping.'
  },
  {
    section: 2,
    indexTag: '03 // FUTURE TECH',
    title: 'XR / VR / AI',
    description: 'Realtime WebXR, Apple Vision Pro',
    description2: '& AI spatial environments.'
  },
  {
    section: 3,
    indexTag: '04 // CONNECTED',
    title: 'MULTIPLAYER',
    description: 'Scalable web-based multiplayer events',
    description2: 'for thousands of concurrent users.'
  },
  {
    section: 4,
    indexTag: '05 // GAMING',
    title: 'GAMES',
    description: 'High-performance 3D browser gaming',
    description2: 'built with custom engine.'
  }
];

export function createGlassCards() {
  const group = new THREE.Group();
  group.name = 'CardsGroup';

  CARD_SECTIONS_DATA.forEach((data) => {
    const cardGroup = new THREE.Group();
    cardGroup.name = `Card_${data.section}`;

    // Flat Rectangular Glass Backing (1.8 x 1.0 units)
    const glassGeom = new THREE.PlaneGeometry(1.8, 1.0);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1a0836'),
      metalness: 0.15,
      roughness: 0.10,
      transmission: 0.80,
      ior: 1.45,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    cardGroup.add(glassMesh);

    // Front Text Texture Plane (1.78 x 0.98 units)
    const textGeom = new THREE.PlaneGeometry(1.78, 0.98);
    const textTexture = createCardCanvasTexture(data);
    const textMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const textMesh = new THREE.Mesh(textGeom, textMat);
    textMesh.position.z = 0.025;
    cardGroup.add(textMesh);

    cardGroup.userData = data;
    group.add(cardGroup);
  });

  return group;
}
