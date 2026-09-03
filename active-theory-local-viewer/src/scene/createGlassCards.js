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
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(0.5, 'rgba(155, 7, 195, 0.12)');
  grad.addColorStop(1, 'rgba(46, 18, 100, 0.18)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // Border outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
  ctx.lineWidth = 6;
  ctx.strokeRect(12, 12, 1000, 488);

  // Corner Accents
  ctx.fillStyle = '#c103e5';
  ctx.fillRect(12, 12, 40, 6);
  ctx.fillRect(12, 12, 6, 40);
  ctx.fillRect(972, 466, 40, 6);
  ctx.fillRect(1006, 432, 6, 40);

  // Section Index Tag
  ctx.fillStyle = 'rgba(255, 255, 255, 0.70)';
  ctx.font = '700 28px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText(data.indexTag, 48, 72);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 64px "NB Architekt Std", system-ui, sans-serif';
  ctx.fillText(data.title, 48, 160);

  // Subtitle / Description
  ctx.fillStyle = 'rgba(240, 240, 255, 0.85)';
  ctx.font = '400 28px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText(data.description, 48, 225);
  if (data.description2) {
    ctx.fillText(data.description2, 48, 265);
  }

  // Footer Link CTA
  ctx.fillStyle = '#c103e5';
  ctx.font = '700 30px "NB Architekt Std", monospace, sans-serif';
  ctx.fillText('EXPLORE SECTION ->', 48, 440);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createGlassCards() {
  const group = new THREE.Group();
  group.name = 'CardsGroup';

  const cardData = [
    {
      section: 0,
      indexTag: '01 // PORTFOLIO',
      title: 'WEBSITES',
      description: 'Award-winning immersive web experiences',
      description2: '& dynamic 3D web applications.',
      baseX: -1.7,
      baseY: 3.0,
      baseZ: 0.6,
      rotationY: 0.22
    },
    {
      section: 1,
      indexTag: '02 // EXPERIENCES',
      title: 'INSTALLATIONS',
      description: 'Interactive physical spaces, digital art',
      description2: '& large-scale projection mapping.',
      baseX: 1.8,
      baseY: 1.0,
      baseZ: 0.6,
      rotationY: -0.24
    },
    {
      section: 2,
      indexTag: '03 // FUTURE TECH',
      title: 'XR / VR / AI',
      description: 'Realtime WebXR, Apple Vision Pro apps',
      description2: '& AI-generated spatial environments.',
      baseX: -1.7,
      baseY: -1.0,
      baseZ: 0.6,
      rotationY: 0.22
    },
    {
      section: 3,
      indexTag: '04 // CONNECTED',
      title: 'MULTIPLAYER',
      description: 'Scalable web-based multiplayer events',
      description2: 'for thousands of concurrent users.',
      baseX: 1.8,
      baseY: -3.0,
      baseZ: 0.6,
      rotationY: -0.24
    },
    {
      section: 4,
      indexTag: '05 // GAMING',
      title: 'GAMES',
      description: 'High-performance 3D browser gaming',
      description2: 'built with custom WebGL engine.',
      baseX: -1.7,
      baseY: -5.0,
      baseZ: 0.6,
      rotationY: 0.22
    }
  ];

  cardData.forEach((data) => {
    const cardGroup = new THREE.Group();
    cardGroup.name = `Card_${data.section}`;

    // Curvy Glass Backing (Physical Glass Material)
    const glassGeom = createCurvyPlaneGeometry(3.2, 1.7, 24, 24, 0.35);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      metalness: 0.1,
      roughness: 0.12,
      transmission: 0.85,
      ior: 1.45,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    cardGroup.add(glassMesh);

    // Front Text Texture Plane (Curvy matching the glass backing)
    const textGeom = createCurvyPlaneGeometry(3.18, 1.68, 24, 24, 0.35);
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

    // Initial position & rotation
    cardGroup.position.set(data.baseX, data.baseY, data.baseZ);
    cardGroup.rotation.y = data.rotationY;
    cardGroup.userData = data;

    group.add(cardGroup);
  });

  return group;
}
