import * as THREE from 'three';

export async function loadDracoDecoder() {
  if (window.DracoDecoderModule) {
    return window.DracoDecoderModule;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/draco_wasm_wrapper.js';
    script.onload = () => {
      if (window.DracoDecoderModule) {
        resolve(window.DracoDecoderModule);
      } else {
        reject(new Error('DracoDecoderModule not defined after script load'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function initDraco(DracoDecoderModule) {
  return new Promise((resolve) => {
    DracoDecoderModule({
      locateFile: (path) => {
        if (path.endsWith('.wasm')) return '/draco_decoder.wasm';
        return path;
      }
    }).then((draco) => {
      resolve(draco);
    });
  });
}

export async function loadBinaryBuffer(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to load binary buffer ${url}: ${resp.statusText}`);
  const arrayBuffer = await resp.arrayBuffer();
  return arrayBuffer;
}
