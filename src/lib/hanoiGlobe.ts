import * as THREE from 'three';

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function buildGraticule(radius: number) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.18 });
  const segments = 96;
  for (let i = 0; i < 12; i++) {
    const lng = (i / 12) * 360 - 180;
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= segments; j++) pts.push(latLngToVec3((j / segments) * 180 - 90, lng, radius));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  [-60,-30,0,30,60].forEach((lat) => {
    const pts: THREE.Vector3[] = [];
    for (let j = 0; j <= segments; j++) pts.push(latLngToVec3(lat, (j / segments) * 360 - 180, radius));
    const m = lat === 0 ? new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }) : mat;
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), m));
  });
  return group;
}

const FALLBACK_GEO = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-17,14],[-12,8],[-8,4],[-2,4],[6,4],[9,0],[12,-5],[14,-12],[18,-20],[20,-30],[25,-34],[32,-28],[35,-20],[40,-10],[42,0],[44,11],[50,12],[49,8],[44,5],[40,12],[38,16],[33,22],[30,28],[25,31],[10,33],[-2,35],[-9,32],[-12,27],[-15,20],[-17,14]]] }},
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-10,36],[0,43],[10,45],[22,41],[28,41],[32,36],[36,36],[40,40],[48,39],[50,30],[55,26],[60,25],[70,24],[78,18],[80,12],[85,22],[92,22],[100,14],[106,11],[109,14],[122,15],[122,30],[130,35],[140,36],[142,45],[135,53],[128,58],[110,63],[90,68],[60,70],[40,70],[20,70],[10,65],[5,60],[10,55],[0,50],[-10,36]]] }},
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-160,65],[-140,70],[-120,70],[-100,70],[-80,65],[-70,60],[-60,50],[-65,45],[-70,40],[-75,35],[-80,30],[-85,28],[-95,28],[-97,22],[-105,22],[-110,28],[-117,32],[-122,38],[-125,45],[-130,55],[-145,60],[-160,65]]] }},
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[-80,10],[-70,10],[-60,7],[-50,0],[-44,-8],[-40,-16],[-43,-25],[-50,-34],[-58,-38],[-66,-45],[-70,-55],[-72,-50],[-72,-40],[-78,-32],[-78,-20],[-80,-10],[-80,0],[-80,10]]] }},
    { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[[115,-30],[122,-33],[130,-32],[138,-34],[145,-38],[150,-38],[153,-28],[148,-22],[142,-10],[134,-12],[125,-15],[115,-20],[114,-25],[115,-30]]] }},
  ],
};

function buildContinents(geojson: any, radius: number) {
  const group = new THREE.Group();
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
  function addRing(coords: [number,number][]) {
    const pts = coords.map(([lng, lat]) => latLngToVec3(lat, lng, radius * 1.001));
    if (pts.length < 2) return;
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  function walk(g: any) {
    if (!g) return;
    if (g.type === 'Polygon') g.coordinates.forEach(addRing);
    else if (g.type === 'MultiPolygon') g.coordinates.forEach((p: any) => p.forEach(addRing));
    else if (g.type === 'GeometryCollection') g.geometries.forEach(walk);
  }
  if (geojson.type === 'FeatureCollection') geojson.features.forEach((f: any) => walk(f.geometry));
  else walk(geojson);
  return group;
}

function buildPin(point: THREE.Vector3, accent: string) {
  const group = new THREE.Group();
  const col = new THREE.Color(accent);
  const poleLen = 0.32;
  const poleEnd = point.clone().multiplyScalar(1 + poleLen / point.length());
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([point, poleEnd]), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.95 })));
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), new THREE.MeshBasicMaterial({ color: col }));
  tip.position.copy(poleEnd);
  group.add(tip);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.25 }));
  halo.position.copy(poleEnd);
  group.add(halo);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.085, 32), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.75, side: THREE.DoubleSide }));
  ring.position.copy(point);
  ring.lookAt(point.clone().multiplyScalar(2));
  group.add(ring);
  group.userData.halo = halo;
  group.userData.ring = ring;
  return group;
}

function buildArcs(origin: [number,number], targets: [number,number][], radius: number, accent: string) {
  const group = new THREE.Group();
  const col = new THREE.Color(accent);
  const originVec = latLngToVec3(origin[0], origin[1], radius);
  targets.forEach((t) => {
    const dest = latLngToVec3(t[0], t[1], radius);
    const mid = originVec.clone().add(dest).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(radius + originVec.distanceTo(dest) * 0.45);
    const pts = new THREE.QuadraticBezierCurve3(originVec, mid, dest).getPoints(48);
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.45 })));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.7 }));
    dot.position.copy(dest);
    group.add(dot);
  });
  return group;
}

export function mountHanoiGlobe(el: HTMLElement, opts: { accent: string }) {
  let accent = opts.accent;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.4, 6);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  el.appendChild(renderer.domElement);
  Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });

  const radius = 1.7;
  const root = new THREE.Group();
  scene.add(root);
  root.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 0.995, 64, 48), new THREE.MeshBasicMaterial({ color: 0x05050a, transparent: true, opacity: 0.92 })));
  root.add(new THREE.Mesh(new THREE.SphereGeometry(radius * 1.02, 64, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.05, side: THREE.BackSide })));
  root.add(buildGraticule(radius));
  let continents = buildContinents(FALLBACK_GEO, radius);
  root.add(continents);

  (async () => {
    try {
      const res = await fetch('https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson/110m/physical/ne_110m_land.json');
      if (res.ok) {
        const data = await res.json();
        if (data.type !== 'Topology') {
          root.remove(continents);
          continents = buildContinents(data, radius);
          root.add(continents);
        }
      }
    } catch {}
  })();

  const HANOI: [number,number] = [21.0285, 105.8542];
  const hanoiPoint = latLngToVec3(HANOI[0], HANOI[1], radius);
  const pin = buildPin(hanoiPoint, accent);
  root.add(pin);

  const CITIES: [number,number][] = [[37.7749,-122.4194],[40.7128,-74.006],[51.5074,-0.1278],[35.6762,139.6503],[1.3521,103.8198],[-33.8688,151.2093],[52.52,13.405]];
  const arcs = buildArcs(HANOI, CITIES, radius, accent);
  root.add(arcs);

  const eqPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 128; i++) {
    const a = (i / 128) * Math.PI * 2;
    eqPts.push(new THREE.Vector3(Math.cos(a) * radius * 1.06, 0, Math.sin(a) * radius * 1.06));
  }
  const equator = new THREE.Line(new THREE.BufferGeometry().setFromPoints(eqPts), new THREE.LineBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.45 }));
  root.add(equator);

  root.rotation.z = -0.41;
  root.rotation.x = -0.15;
  root.rotation.y = -1.1;

  let targetRotY = root.rotation.y, targetRotX = root.rotation.x;
  let dragging = false, lastX = 0, lastY = 0;

  const onMove = (e: PointerEvent) => { if (dragging) { targetRotY += (e.clientX - lastX) * 0.005; targetRotX = Math.max(-0.9, Math.min(0.9, targetRotX + (e.clientY - lastY) * 0.005)); lastX = e.clientX; lastY = e.clientY; } };
  const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; lastY = e.clientY; };
  const onUp = () => { dragging = false; };
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  function resize() {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(el);
  resize();

  let raf = 0, t0 = performance.now();
  function animate() {
    const now = performance.now();
    const dt = (now - t0) / 1000; t0 = now;
    if (!dragging) targetRotY += dt * 0.12;
    root.rotation.y += (targetRotY - root.rotation.y) * 0.08;
    root.rotation.x += (targetRotX - root.rotation.x) * 0.08;
    const pulse = 1 + Math.sin(now * 0.004) * 0.25;
    if (pin.userData.halo) pin.userData.halo.scale.setScalar(pulse);
    if (pin.userData.ring) {
      const rp = 1 + ((now * 0.001) % 1);
      pin.userData.ring.scale.setScalar(rp);
      pin.userData.ring.material.opacity = 0.75 * (1 - ((now * 0.001) % 1));
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  animate();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    },
    setAccent(c: string) {
      accent = c;
      const col = new THREE.Color(c);
      pin.children.forEach((m: any) => { if (m.material?.color) m.material.color.set(col); });
      arcs.children.forEach((m: any) => { if (m.material?.color) m.material.color.set(col); });
      (equator.material as THREE.LineBasicMaterial).color.set(col);
    },
  };
}
