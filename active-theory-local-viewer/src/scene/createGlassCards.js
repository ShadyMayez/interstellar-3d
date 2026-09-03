import * as THREE from 'three';

export function createGlassCards() {
  const group = new THREE.Group();
  group.name = 'CardsGroup';

  const cardData = [
    { title: 'WEBSITES', baseX: -2.2, baseY: 1.2, parallaxStrength: 0.15, speed: 0.8 },
    { title: 'INSTALLATIONS', baseX: 2.0, baseY: 0.2, parallaxStrength: 0.22, speed: 0.9 },
    { title: 'XR / VR / AI', baseX: -1.8, baseY: -1.2, parallaxStrength: 0.18, speed: 0.7 },
  ];

  cardData.forEach((data) => {
    const geom = new THREE.PlaneGeometry(2.4, 1.4);
    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#ffffff'),
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.9,
      ior: 1.5,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(data.baseX, data.baseY, 0);
    mesh.userData = data;
    group.add(mesh);
  });

  return group;
}
