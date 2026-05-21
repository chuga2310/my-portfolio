import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Fixed base angles — lid visible, model leans slightly left
const BASE_ROT_X = 0.22;
const BASE_ROT_Y = -0.28;
const MAX_TILT = 0.14; // max mouse influence in radians
const LERP = 0.055;

export function HeroScene() {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = stageRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // ── Renderer ───────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false); // false = don't overwrite CSS
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    const canvas = renderer.domElement;
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    container.prepend(canvas);

    // ── Scene / Camera ─────────────────────────────────────────
    const scene = new THREE.Scene();

    // PBR environment map (critical for metallic materials)
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    camera.position.set(0, 0.4, 9.5);

    // ── Lighting ───────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const key = new THREE.DirectionalLight(0xffffff, 2.8);
    key.position.set(4, 6, 4);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0x88aaff, 0.9);
    fill.position.set(-5, 1, -2);
    scene.add(fill);

    const rim = new THREE.DirectionalLight(0x00d4ff, 0.5);
    rim.position.set(0, -3, -5);
    scene.add(rim);

    // ── Model group (receives mouse rotation) ──────────────────
    const group = new THREE.Group();
    scene.add(group);

    // Current lerp targets
    let curX = BASE_ROT_X;
    let curY = BASE_ROT_Y;
    let tgtX = BASE_ROT_X;
    let tgtY = BASE_ROT_Y;
    group.position.x = 2.5; // shift MacBook into right half of full-width scene
    group.rotation.x = curX;
    group.rotation.y = curY;

    // ── Mouse tracking ─────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - (rect.left + rect.width * 0.5)) / (rect.width * 0.5);
      const ny = (e.clientY - (rect.top + rect.height * 0.5)) / (rect.height * 0.5);
      tgtY = BASE_ROT_Y + nx * MAX_TILT;
      tgtX = BASE_ROT_X - ny * MAX_TILT;
    };
    window.addEventListener('mousemove', onMouseMove);

    // ── Load VSCode screen texture ─────────────────────────────
    let screenMat: THREE.MeshBasicMaterial | null = null;
    const vscodeTex = new THREE.TextureLoader().load('/vscode-screen.png', () => {
      if (screenMat) screenMat.needsUpdate = true;
    });
    vscodeTex.colorSpace = THREE.SRGBColorSpace;
    vscodeTex.flipY = true;

    // ── Load GLB ───────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      '/macbook_pro_m3_16_inch_2024.glb',
      (gltf) => {
        const model = gltf.scene;

        // Apply VSCode texture to the LCD screen mesh (Object_123)
        model.traverse((obj) => {
          const mesh = obj as THREE.Mesh;
          if (mesh.isMesh && mesh.name === 'Object_123') {
            const mat = new THREE.MeshBasicMaterial({
              map: vscodeTex,
              toneMapped: false,
            });
            screenMat = mat;
            mesh.material = mat;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 9.2 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(scale);
        model.position.set(-center.x * scale, -center.y * scale + 0.3, -center.z * scale);
        group.add(model);
      },
      undefined,
      (err) => console.error('[HeroScene] GLB load failed:', err),
    );

    // ── RAF loop ───────────────────────────────────────────────
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      curX += (tgtX - curX) * LERP;
      curY += (tgtY - curY) * LERP;
      group.rotation.x = curX;
      group.rotation.y = curY;
      renderer.render(scene, camera);
    };
    animate();

    // ── Resize ─────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      renderer.setSize(nw, nh, false);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      ro.disconnect();
      renderer.dispose();
      canvas.parentElement?.removeChild(canvas);
    };
  }, []);

  return (
    <div className="hero-3d" aria-hidden="true">
      <div className="orbit-stage" ref={stageRef}>
        <div className="center-hud">
          <div className="hud-row"><span className="hud-k">SYS</span><span className="hud-v ok">● ONLINE</span></div>
          <div className="hud-row"><span className="hud-k">LOC</span><span className="hud-v">HAN · UTC+7</span></div>
          <div className="hud-row"><span className="hud-k">UPT</span><span className="hud-v">7Y 4M</span></div>
          <div className="hud-bar"><div className="hud-bar-fill" /></div>
        </div>
      </div>
    </div>
  );
}
