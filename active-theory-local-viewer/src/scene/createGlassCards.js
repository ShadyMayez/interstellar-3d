import * as THREE from 'three';

function createRoundedCardShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function createCardCanvasTexture(data) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Clip canvas to smooth rounded corners (no box border lines or corner accents!)
  ctx.beginPath();
  ctx.roundRect(0, 0, 1024, 512, 48);
  ctx.clip();

  // Glass Tint Background matching card palette color (no black edges!)
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, data.bgStart);
  grad.addColorStop(1, data.bgEnd);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Top specular reflection highlight
  const lightGrad = ctx.createLinearGradient(0, 0, 0, 140);
  lightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
  lightGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, 1024, 140);

  // Section Index Tag
  ctx.fillStyle = data.accentColor;
  ctx.font = '700 26px "Space Grotesk", "Outfit", monospace, sans-serif';
  ctx.fillText(data.indexTag, 56, 76);

  // Title with glow shadow for dark cards
  if (data.textColor === '#ffffff') {
    ctx.shadowColor = data.accentColor;
    ctx.shadowBlur = 16;
  } else {
    ctx.shadowBlur = 0;
  }
  ctx.fillStyle = data.textColor;
  ctx.font = '900 68px "Syne", "Space Grotesk", "Outfit", system-ui, sans-serif';
  ctx.fillText(data.title, 56, 172);

  // Subtitle / Description
  ctx.shadowBlur = 0;
  ctx.fillStyle = data.subTextColor;
  ctx.font = '500 28px "Space Grotesk", "Inter", system-ui, sans-serif';
  ctx.fillText(data.description, 56, 248);
  if (data.description2) {
    ctx.fillText(data.description2, 56, 288);
  }

  // Footer CTA Link Badge
  ctx.fillStyle = data.badgeBg;
  ctx.beginPath();
  ctx.roundRect(56, 396, 310, 54, 27);
  ctx.fill();
  ctx.strokeStyle = data.accentColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = data.accentColor;
  ctx.font = '700 24px "Space Grotesk", monospace, sans-serif';
  ctx.fillText('EXPLORE SECTION  →', 78, 432);

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
    description2: '& dynamic WebGL applications.',
    glassColor: '#DDDBDE',
    bgStart: '#DDDBDE',
    bgEnd: '#C2C0C3',
    textColor: '#1a162b',
    subTextColor: '#3a354d',
    accentColor: '#5900b3',
    badgeBg: 'rgba(89, 0, 179, 0.12)'
  },
  {
    section: 1,
    indexTag: '02 // EXPERIENCES',
    title: 'INSTALLATIONS',
    description: 'Interactive physical spaces, digital art',
    description2: '& spatial projection mapping.',
    glassColor: '#CAD4DF',
    bgStart: '#CAD4DF',
    bgEnd: '#B0BDCD',
    textColor: '#0e1826',
    subTextColor: '#283648',
    accentColor: '#0066cc',
    badgeBg: 'rgba(0, 102, 204, 0.12)'
  },
  {
    section: 2,
    indexTag: '03 // FUTURE TECH',
    title: 'XR / VR / AI',
    description: 'Realtime WebXR, Apple Vision Pro',
    description2: '& AI spatial environments.',
    glassColor: '#656E77',
    bgStart: '#656E77',
    bgEnd: '#4B535C',
    textColor: '#ffffff',
    subTextColor: '#e2e6eb',
    accentColor: '#00f0ff',
    badgeBg: 'rgba(0, 240, 255, 0.14)'
  },
  {
    section: 3,
    indexTag: '04 // CONNECTED',
    title: 'MULTIPLAYER',
    description: 'Scalable web-based multiplayer events',
    description2: 'for thousands of concurrent users.',
    glassColor: '#3B373B',
    bgStart: '#3B373B',
    bgEnd: '#252225',
    textColor: '#ffffff',
    subTextColor: '#dcd6dc',
    accentColor: '#ff007f',
    badgeBg: 'rgba(255, 0, 127, 0.14)'
  },
  {
    section: 4,
    indexTag: '05 // GAMING',
    title: 'GAMES',
    description: 'High-performance 3D browser gaming',
    description2: 'built with custom engine.',
    glassColor: '#DDDBDE',
    bgStart: '#E4E2E6',
    bgEnd: '#C8C5CC',
    textColor: '#181226',
    subTextColor: '#362d48',
    accentColor: '#7b00ff',
    badgeBg: 'rgba(123, 0, 255, 0.12)'
  },
  {
    section: 5,
    indexTag: '06 // SPATIAL',
    title: 'VISION PRO',
    description: 'Spatial computing, volumetric UI',
    description2: '& visionOS native 3D web experiences.',
    glassColor: '#CAD4DF',
    bgStart: '#BDC8D6',
    bgEnd: '#9FAEC2',
    textColor: '#0b1626',
    subTextColor: '#23354a',
    accentColor: '#0088ff',
    badgeBg: 'rgba(0, 136, 255, 0.12)'
  },
  {
    section: 6,
    indexTag: '07 // ARTIFICIAL',
    title: 'NEURAL LABS',
    description: 'Generative 3D GLSL shaders, AI models',
    description2: '& real-time neural graphics pipelines.',
    glassColor: '#656E77',
    bgStart: '#5B646D',
    bgEnd: '#3F474F',
    textColor: '#ffffff',
    subTextColor: '#e0e5eb',
    accentColor: '#00ffcc',
    badgeBg: 'rgba(0, 255, 204, 0.14)'
  },
  {
    section: 7,
    indexTag: '08 // IMMERSIVE',
    title: 'AUDIO VISUAL',
    description: 'Realtime audio-reactive 3D scenes',
    description2: '& spatial soundscapes.',
    glassColor: '#3B373B',
    bgStart: '#322E32',
    bgEnd: '#1D1A1D',
    textColor: '#ffffff',
    subTextColor: '#d8d2d8',
    accentColor: '#e600ff',
    badgeBg: 'rgba(230, 0, 255, 0.14)'
  },
  {
    section: 8,
    indexTag: '09 // ENTERPRISE',
    title: '3D ENGINE',
    description: 'Custom WebGL frameworks, tools',
    description2: '& high-speed asset pipelines.',
    glassColor: '#CAD4DF',
    bgStart: '#D3DBE4',
    bgEnd: '#B5C2D0',
    textColor: '#101824',
    subTextColor: '#2a384c',
    accentColor: '#0055ff',
    badgeBg: 'rgba(0, 85, 255, 0.12)'
  }
];

export function createGlassCards() {
  const group = new THREE.Group();
  group.name = 'CardsGroup';

  // Create 3D Extruded Beveled Rounded Geometry (Sleek thin glass plate: Depth = 0.02, Radius = 0.12, Bevel = 0.008)
  const shape = createRoundedCardShape(1.8, 1.0, 0.12);
  const extrudeSettings = {
    steps: 1,
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelOffset: 0,
    bevelSegments: 3
  };
  const glassGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  glassGeom.center();

  CARD_SECTIONS_DATA.forEach((data) => {
    const cardGroup = new THREE.Group();
    cardGroup.name = `Card_${data.section}`;

    // Physical Glass Material for 3D Thin Block (Matching individual card palette color!)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(data.glassColor),
      metalness: 0.05,
      roughness: 0.10,
      transmission: 0.70,
      ior: 1.45,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    cardGroup.add(glassMesh);

    // Front Text Texture Plane (1.84 x 1.04 units to cover front face seamlessly!)
    const textGeom = new THREE.PlaneGeometry(1.84, 1.04);
    const textTexture = createCardCanvasTexture(data);
    const textMat = new THREE.MeshBasicMaterial({
      map: textTexture,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const textMesh = new THREE.Mesh(textGeom, textMat);
    textMesh.position.z = 0.019;
    cardGroup.add(textMesh);

    cardGroup.userData = data;
    group.add(cardGroup);
  });

  return group;
}
