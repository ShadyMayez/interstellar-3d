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
  { p: 0.00, cam: new THREE.Vector3( 0.3,  4.2,  4.5), target: new THREE.Vector3(0.50,  3.6, -0.5) 

        // Mouse parallax
        card.position.x = d.baseX + mouse.x * d.parallaxStrength;

        // Fade in
        if (card.material) {
          if (card.material.userData.baseOpacity === undefined) {
            card.material.userData.baseOpacity = card.material.opacity;
          }
          card.material.opacity = card.material.userData.baseOpacity * cardsT;
          card.material.visible = (cardsT > 0.01);
        }
      });
    }

    // ── Render ──
    postprocessing.update(t);
    postprocessing.composer.render();
  }

  animate();
}

/* ──────────────────────────────────────────────
   Event handlers
   ────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   Start
   ────────────────────────────────────────────── */
window.addEventListener('DOMContentLoaded', init);
