import * as THREE from "three";
import type { WalkRequest, WalkTradition } from "@/data/walkProfiles";
import {
  applyWorldSpaceGroundShader,
  type WalkTextureSet,
} from "@/lib/threeWalkTextures";

export type BuiltWalkScene = {
  scene: THREE.Scene;
  cameraStartZ: number;
  cameraStartY: number;
  cameraEndZ: number;
  cameraEndY: number;
  stepsStartZ: number;
  stepsEndZ: number;
  stepsTopY: number;
  doorZ: number;
  update: (progress: number, elapsedSec: number, viewportAspect: number) => void;
  dispose: () => void;
};

type DisposableStore = {
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
  textures: THREE.Texture[];
};

function trackGeo<T extends THREE.BufferGeometry>(
  store: DisposableStore,
  geo: T,
): T {
  store.geometries.push(geo);
  return geo;
}

function trackMat<T extends THREE.Material>(
  store: DisposableStore,
  mat: T,
): T {
  store.materials.push(mat);
  return mat;
}

function addContactShadow(
  store: DisposableStore,
  parent: THREE.Object3D,
  shadowMap: THREE.Texture,
  x: number,
  y: number,
  z: number,
  radiusX: number,
  radiusZ = radiusX,
  opacity = 0.55,
) {
  const geo = trackGeo(store, new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2));
  const mat = trackMat(
    store,
    new THREE.MeshBasicMaterial({
      map: shadowMap,
      transparent: true,
      opacity,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    }),
  );
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y + 0.012, z);
  parent.add(mesh);
  return mesh;
}

function createSkyDome(
  store: DisposableStore,
  skyTex: THREE.Texture,
): THREE.Mesh {
  const geo = trackGeo(store, new THREE.SphereGeometry(95, 28, 18));
  const mat = trackMat(
    store,
    new THREE.MeshBasicMaterial({
      map: skyTex,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    }),
  );
  return new THREE.Mesh(geo, mat);
}

/**
 * 分层远山剪影（替代生硬多边形锥体，贴合东方山水与古刹远景）
 */
function buildLayeredMistyMountains(
  store: DisposableStore,
  texSet: WalkTextureSet,
  tradition: WalkTradition,
): THREE.Group {
  const g = new THREE.Group();
  const layers = [
    { z: -48, y: 7.5, w: 120, h: 24, tint: tradition === "buddhist" ? 0xa5abb0 : 0x7e9995, opacity: 0.72 },
    { z: -64, y: 11.5, w: 155, h: 32, tint: tradition === "buddhist" ? 0xc0c2c4 : 0x9eb5b1, opacity: 0.52 },
  ];
  layers.forEach((l, idx) => {
    const mat = trackMat(
      store,
      new THREE.MeshBasicMaterial({
        map: texSet.mountainRidgeMap,
        color: l.tint,
        transparent: true,
        opacity: l.opacity,
        depthWrite: false,
        fog: true,
      }),
    );
    const mesh = new THREE.Mesh(
      trackGeo(store, new THREE.PlaneGeometry(l.w, l.h)),
      mat,
    );
    mesh.position.set(idx === 0 ? -4 : 6, l.y, l.z);
    g.add(mesh);
  });
  return g;
}

/**
 * 自然松柏树木群组（弯曲树干 + 多层松枝插片，零卡通圆锥）
 */
function buildOrganicPineTree(
  store: DisposableStore,
  texSet: WalkTextureSet,
  tradition: WalkTradition,
  scale = 1,
): THREE.Group {
  const g = new THREE.Group();
  const barkMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.pillarWoodMap,
      color: tradition === "daoist" ? 0x4f4339 : 0x5c4738,
      roughness: 0.92,
      metalness: 0.02,
    }),
  );
  const boughMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.foliageBoughMap,
      alphaTest: 0.28,
      transparent: false,
      side: THREE.DoubleSide,
      roughness: 0.84,
      metalness: 0.02,
    }),
  );

  // Tapered slightly crooked trunk
  const lowerTrunk = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, 2.5 * scale, 10)),
    barkMat,
  );
  lowerTrunk.position.y = 1.25 * scale;
  lowerTrunk.rotation.z = 0.03;
  g.add(lowerTrunk);

  const upperTrunk = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.08 * scale, 0.16 * scale, 2.3 * scale, 9)),
    barkMat,
  );
  upperTrunk.position.set(-0.07 * scale, 3.4 * scale, 0.03 * scale);
  upperTrunk.rotation.z = -0.05;
  g.add(upperTrunk);

  // Overlapping crossed botanical bough cards at varied elevations & yaw angles
  const boughTiers = [
    { y: 2.8 * scale, w: 3.1 * scale, h: 2.2 * scale, rotY: 0.2 },
    { y: 3.1 * scale, w: 3.0 * scale, h: 2.1 * scale, rotY: 1.75 },
    { y: 3.85 * scale, w: 2.6 * scale, h: 2.0 * scale, rotY: 0.85 },
    { y: 4.0 * scale, w: 2.5 * scale, h: 1.9 * scale, rotY: 2.4 },
    { y: 4.75 * scale, w: 2.0 * scale, h: 1.7 * scale, rotY: 0.45 },
  ];
  boughTiers.forEach((tier) => {
    const plane = new THREE.Mesh(
      trackGeo(store, new THREE.PlaneGeometry(tier.w, tier.h)),
      boughMat,
    );
    plane.position.y = tier.y;
    plane.rotation.y = tier.rotY;
    g.add(plane);
  });

  addContactShadow(store, g, texSet.contactShadowMap, 0, 0, 0, 1.3 * scale, 1.3 * scale, 0.45);
  return g;
}

/**
 * 多部件传统石灯笼（带须弥底座、雕柱、灯室窗格、六角攒尖盖与地面投影）
 */
function buildStoneLantern(
  store: DisposableStore,
  texSet: WalkTextureSet,
  tradition: WalkTradition,
  withLight: boolean,
): THREE.Group {
  const g = new THREE.Group();
  const stoneMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.graniteStepMap,
      bumpMap: texSet.graniteStepBump,
      bumpScale: 0.025,
      color: tradition === "daoist" ? 0x9aa49e : 0xa59d92,
      roughness: 0.86,
      metalness: 0.04,
    }),
  );
  const darkFrameMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      color: 0x3b352f,
      roughness: 0.8,
      metalness: 0.08,
    }),
  );
  const glowMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      color: 0xfff0cc,
      emissive: tradition === "daoist" ? 0xffcc73 : 0xffb854,
      emissiveIntensity: 1.15,
      roughness: 0.4,
    }),
  );

  // Two-tier stepped plinth
  const base1 = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(0.68, 0.14, 0.68)),
    stoneMat,
  );
  base1.position.y = 0.07;
  const base2 = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(0.5, 0.12, 0.5)),
    stoneMat,
  );
  base2.position.y = 0.2;
  g.add(base1, base2);

  // Octagonal carved stone column
  const shaft = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.11, 0.145, 0.84, 8)),
    stoneMat,
  );
  shaft.position.y = 0.68;
  g.add(shaft);

  // Lotus pedestal tray
  const tray = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.32, 0.18, 0.14, 8)),
    stoneMat,
  );
  tray.position.y = 1.16;
  g.add(tray);

  // Lantern chamber with corner mullions
  const chamber = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.18, 0.18, 0.3, 6)),
    glowMat,
  );
  chamber.position.y = 1.38;
  g.add(chamber);

  for (let i = 0; i < 6; i += 1) {
    const a = (i * Math.PI * 2) / 6;
    const mullion = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.035, 0.32, 0.035)),
      darkFrameMat,
    );
    mullion.position.set(Math.cos(a) * 0.19, 1.38, Math.sin(a) * 0.19);
    g.add(mullion);
  }

  // Curved eaves cap + finial
  const cap = new THREE.Mesh(
    trackGeo(store, new THREE.ConeGeometry(0.42, 0.24, 6)),
    stoneMat,
  );
  cap.position.y = 1.65;
  const finial = new THREE.Mesh(
    trackGeo(store, new THREE.SphereGeometry(0.065, 10, 8)),
    stoneMat,
  );
  finial.position.y = 1.8;
  g.add(cap, finial);

  if (withLight) {
    const pt = new THREE.PointLight(0xffcb7e, 1.15, 6.5, 2);
    pt.position.y = 1.38;
    g.add(pt);
  }

  addContactShadow(store, g, texSet.contactShadowMap, 0, 0, 0, 0.62, 0.62, 0.5);
  return g;
}

/**
 * 传统青铜三足鼎式香炉（放置须弥石座之上，带真实接触影）
 */
function buildBronzeCauldron(
  store: DisposableStore,
  texSet: WalkTextureSet,
  tradition: WalkTradition,
): THREE.Group {
  const g = new THREE.Group();
  const stoneMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.graniteStepMap,
      bumpMap: texSet.graniteStepBump,
      bumpScale: 0.02,
      color: 0xa6a097,
      roughness: 0.84,
      metalness: 0.04,
    }),
  );
  const bronzeMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      color: tradition === "daoist" ? 0x3b4942 : 0x4d3a26,
      roughness: 0.38,
      metalness: 0.8,
    }),
  );

  const plinthLower = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.66, 0.74, 0.16, 8)),
    stoneMat,
  );
  plinthLower.position.y = 0.08;
  const plinthUpper = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.56, 0.62, 0.14, 8)),
    stoneMat,
  );
  plinthUpper.position.y = 0.23;
  g.add(plinthLower, plinthUpper);

  const legGeo = trackGeo(store, new THREE.CylinderGeometry(0.055, 0.04, 0.42, 10));
  for (let i = 0; i < 3; i += 1) {
    const ang = (i * Math.PI * 2) / 3 + Math.PI / 6;
    const leg = new THREE.Mesh(legGeo, bronzeMat);
    leg.position.set(Math.cos(ang) * 0.25, 0.48, Math.sin(ang) * 0.25);
    g.add(leg);
  }

  const belly = new THREE.Mesh(
    trackGeo(store, new THREE.SphereGeometry(0.4, 20, 14)),
    bronzeMat,
  );
  belly.scale.set(1, 0.76, 1);
  belly.position.y = 0.8;
  g.add(belly);

  const rim = new THREE.Mesh(
    trackGeo(store, new THREE.TorusGeometry(0.34, 0.042, 10, 24)),
    bronzeMat,
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.03;
  g.add(rim);

  const earGeo = trackGeo(store, new THREE.TorusGeometry(0.11, 0.022, 8, 16));
  const earL = new THREE.Mesh(earGeo, bronzeMat);
  earL.position.set(-0.39, 0.96, 0);
  const earR = new THREE.Mesh(earGeo, bronzeMat);
  earR.position.set(0.39, 0.96, 0);
  g.add(earL, earR);

  addContactShadow(store, g, texSet.contactShadowMap, 0, 0, 0, 0.9, 0.9, 0.56);
  return g;
}

/**
 * 传统汉白玉石栏杆段（望柱 + 寻杖栏板，符合真实寺院月台规制）
 */
function buildBalustradeSpan(
  store: DisposableStore,
  stoneMat: THREE.Material,
  length: number,
  postCount = 3,
): THREE.Group {
  const g = new THREE.Group();
  const baseCurb = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(length, 0.14, 0.22)),
    stoneMat,
  );
  baseCurb.position.y = 0.07;
  const topRail = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(length, 0.1, 0.18)),
    stoneMat,
  );
  topRail.position.y = 0.72;
  const panel = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(length - 0.18, 0.44, 0.08)),
    stoneMat,
  );
  panel.position.y = 0.42;
  g.add(baseCurb, topRail, panel);

  const postGeo = trackGeo(store, new THREE.BoxGeometry(0.18, 0.88, 0.18));
  const capGeo = trackGeo(store, new THREE.SphereGeometry(0.095, 10, 8));
  for (let i = 0; i < postCount; i += 1) {
    const px = -length / 2 + (length * i) / Math.max(1, postCount - 1);
    const post = new THREE.Mesh(postGeo, stoneMat);
    post.position.set(px, 0.44, 0);
    const cap = new THREE.Mesh(capGeo, stoneMat);
    cap.position.set(px, 0.93, 0);
    g.add(post, cap);
  }
  return g;
}

/**
 * 传统中式挂落宫灯（用于前廊与大殿内部）
 */
function buildPalaceLantern(
  store: DisposableStore,
  tradition: WalkTradition,
  withLight = false,
): THREE.Group {
  const g = new THREE.Group();
  const woodMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      color: tradition === "daoist" ? 0x241d17 : 0x3b1a14,
      roughness: 0.48,
      metalness: 0.16,
    }),
  );
  const silkMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      color: 0xffebc2,
      emissive: 0xffb357,
      emissiveIntensity: 1.35,
      roughness: 0.45,
    }),
  );

  const cord = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.012, 0.012, 0.85, 6)),
    woodMat,
  );
  cord.position.y = 0.425;
  const capTop = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.28, 0.22, 0.09, 6)),
    woodMat,
  );
  capTop.position.y = 0.0;
  const body = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.2, 0.18, 0.46, 6)),
    silkMat,
  );
  body.position.y = -0.27;
  const capBot = new THREE.Mesh(
    trackGeo(store, new THREE.CylinderGeometry(0.2, 0.14, 0.08, 6)),
    woodMat,
  );
  capBot.position.y = -0.53;
  g.add(cord, capTop, body, capBot);

  if (withLight) {
    const pt = new THREE.PointLight(0xffc36e, 2.2, 13, 1.6);
    pt.position.y = -0.28;
    g.add(pt);
  }
  return g;
}

/**
 * 极克制微尘香烟粒子（微弱自然光晕，绝不过度特效）
 */
function buildIncenseMotes(
  store: DisposableStore,
  tradition: WalkTradition,
  bounds: { xSpan: number; yMin: number; yMax: number; zMin: number; zMax: number },
  count = 65,
): THREE.Points {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * bounds.xSpan;
    positions[i * 3 + 1] =
      bounds.yMin + Math.random() * (bounds.yMax - bounds.yMin);
    positions[i * 3 + 2] =
      bounds.zMin + Math.random() * (bounds.zMax - bounds.zMin);
  }
  const geo = trackGeo(store, new THREE.BufferGeometry());
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = trackMat(
    store,
    new THREE.PointsMaterial({
      color: tradition === "buddhist" ? 0xf2d9a8 : 0xddeee8,
      size: 0.045,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
    }),
  );
  return new THREE.Points(geo, mat);
}

/**
 * 构建「寺院青石庭院 -> 白石阶与月台 -> 廊柱重檐飞椽 -> 格扇木门穿门 -> 金砖殿内空间」
 * 完整写实 3D 连续进入大殿场景
 */
function buildHallEntryExitScene(
  request: WalkRequest,
  texSet: WalkTextureSet,
  _exteriorTex: THREE.Texture,
  interiorTex: THREE.Texture,
): BuiltWalkScene {
  const store: DisposableStore = {
    geometries: [],
    materials: [],
    textures: [_exteriorTex, interiorTex],
  };

  const scene = new THREE.Scene();
  const tradition = request.tradition;

  // Natural atmospheric horizon fog (subtle outdoor mist clearing smoothly inside)
  const fogColor =
    tradition === "daoist" ? 0xa3b7b2 : 0xbdb3a4;
  const fog = new THREE.FogExp2(fogColor, 0.014);
  scene.fog = fog;

  scene.add(createSkyDome(store, texSet.skyGradMap));
  scene.add(buildLayeredMistyMountains(store, texSet, tradition));

  // Warm daylight + cool sky fill + subtle warm interior sanctuary illumination
  const hemiLight = new THREE.HemisphereLight(
    tradition === "daoist" ? 0xd9ece6 : 0xfff2dd,
    tradition === "daoist" ? 0x2e3b36 : 0x42382f,
    1.18,
  );
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(
    tradition === "daoist" ? 0xf2fbf7 : 0xfff4de,
    1.45,
  );
  sunLight.position.set(14, 22, 16);
  scene.add(sunLight);

  const interiorHallLight = new THREE.PointLight(0xffcb80, 3.0, 16, 1.4);
  interiorHallLight.position.set(0, 4.1, -5.2);
  scene.add(interiorHallLight);

  const altarFocusLight = new THREE.PointLight(0xffd796, 2.5, 14, 1.3);
  altarFocusLight.position.set(0, 3.9, -9.2);
  scene.add(altarFocusLight);

  // Materials — all using real photography + world-space anti-tiling + roughness variation
  const courtyardGroundMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.courtyardStoneMap,
      bumpMap: texSet.courtyardStoneBump,
      bumpScale: 0.032,
      color: tradition === "daoist" ? 0xdce4df : 0xe8e2d9,
      roughness: 0.84,
      metalness: 0.04,
      envMapIntensity: 0.45,
    }),
  );
  applyWorldSpaceGroundShader(courtyardGroundMat, {
    tradition,
    isInterior: false,
    contactZ: 7.2,
    mossStrength: tradition === "buddhist" ? 0.09 : 0.22,
  });

  const graniteMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.graniteStepMap,
      bumpMap: texSet.graniteStepBump,
      bumpScale: 0.022,
      color: tradition === "daoist" ? 0xd2dad5 : 0xdad3c8,
      roughness: 0.78,
      metalness: 0.04,
      envMapIntensity: 0.48,
    }),
  );

  const pillarMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.pillarWoodMap,
      color: tradition === "daoist" ? 0x628c80 : 0xdcbdb3,
      roughness: 0.46,
      metalness: 0.08,
      envMapIntensity: 0.65,
    }),
  );

  const darkTimberMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.pillarWoodMap,
      color: tradition === "daoist" ? 0x4b5c56 : 0x7a5045,
      roughness: 0.54,
      metalness: 0.08,
      envMapIntensity: 0.5,
    }),
  );

  const goldTrimMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      color: tradition === "daoist" ? 0xc2aa69 : 0xcfa24a,
      roughness: 0.34,
      metalness: 0.76,
    }),
  );

  const doorMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.doorPanelMap,
      color: tradition === "daoist" ? 0xb4c7be : 0xeadcd4,
      roughness: 0.52,
      metalness: 0.12,
      envMapIntensity: 0.55,
    }),
  );

  const roofMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.roofTileMap,
      bumpMap: texSet.roofTileBump,
      bumpScale: 0.03,
      roughness: 0.44,
      metalness: 0.22,
      envMapIntensity: 0.75,
    }),
  );

  // 1. Courtyard Bluestone Ground (Continuous real ashlar stone paving)
  const courtyardFloor = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(42, 34)),
    courtyardGroundMat,
  );
  courtyardFloor.rotation.x = -Math.PI / 2;
  courtyardFloor.position.set(0, 0, 14);
  scene.add(courtyardFloor);

  // Flanking courtyard stone lanterns & bronze cauldron
  [
    { x: -3.55, z: 10.8, light: true },
    { x: 3.55, z: 10.8, light: true },
  ].forEach((item) => {
    const lantern = buildStoneLantern(store, texSet, tradition, item.light);
    lantern.position.set(item.x, 0, item.z);
    scene.add(lantern);
  });

  // Flanking bronze cauldron to the side of the lower forecourt (keeps center pilgrimage axis clear)
  const cauldron = buildBronzeCauldron(store, texSet, tradition);
  cauldron.position.set(-2.65, 0, 8.6);
  scene.add(cauldron);

  // Courtyard flanking covered walkway eaves & columns (gives clear depth parallax without boxiness)
  const corrColGeo = trackGeo(store, new THREE.CylinderGeometry(0.18, 0.21, 3.6, 16));
  const corrPlinthGeo = trackGeo(store, new THREE.CylinderGeometry(0.26, 0.3, 0.18, 16));
  for (let z = 4.2; z <= 14.2; z += 3.3) {
    [-6.6, 6.6].forEach((x) => {
      const base = new THREE.Mesh(corrPlinthGeo, graniteMat);
      base.position.set(x, 0.09, z);
      const col = new THREE.Mesh(corrColGeo, pillarMat);
      col.position.set(x, 1.98, z);
      scene.add(base, col);
      addContactShadow(store, scene, texSet.contactShadowMap, x, 0, z, 0.48, 0.48, 0.42);
    });
  }
  [-6.6, 6.6].forEach((x) => {
    const beam = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.36, 0.34, 14)),
      darkTimberMat,
    );
    beam.position.set(x, 3.88, 9.2);
    const sideRoof = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(2.2, 0.18, 14.4)),
      roofMat,
    );
    sideRoof.position.set(x + (x < 0 ? -0.4 : 0.4), 4.18, 9.2);
    sideRoof.rotation.z = x < 0 ? -0.24 : 0.24;
    scene.add(beam, sideRoof);
  });

  // Organic pine & cypress trees flanking outer courtyard
  [
    { x: -8.8, z: 12.2, s: 1.08 },
    { x: 8.8, z: 12.2, s: 1.12 },
    { x: -9.2, z: 5.5, s: 1.18 },
    { x: 9.2, z: 5.5, s: 1.15 },
    { x: -10.4, z: -1.5, s: 1.25 },
    { x: 10.4, z: -1.5, s: 1.22 },
  ].forEach((t) => {
    const tree = buildOrganicPineTree(store, texSet, tradition, t.s);
    tree.position.set(t.x, 0, t.z);
    scene.add(tree);
  });

  // 2. Ascending Granite Staircase (7 authentic temple steps: z = +7.2 -> +2.6, y = 0 -> 1.05m)
  const stepCount = 7;
  const stepsStartZ = 7.2;
  const stepsEndZ = 2.6;
  const stepsTopY = 1.05;
  const stepHeight = stepsTopY / stepCount;
  const stepDepth = (stepsStartZ - stepsEndZ) / stepCount;

  for (let i = 0; i < stepCount; i += 1) {
    const h = stepHeight * (i + 1);
    const zCenter = stepsStartZ - (i + 0.5) * stepDepth;
    const stepBody = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(4.8, h, stepDepth + 0.03)),
      graniteMat,
    );
    stepBody.position.set(0, h / 2, zCenter);
    // Subtle overhanging granite tread nosing for authentic crisp stair lines
    const treadLip = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(4.84, 0.045, stepDepth * 0.28)),
      graniteMat,
    );
    treadLip.position.set(0, h - 0.022, zCenter + stepDepth * 0.42);
    scene.add(stepBody, treadLip);
  }
  addContactShadow(store, scene, texSet.contactShadowMap, 0, 0, stepsStartZ + 0.15, 2.8, 0.55, 0.44);

  // Inclined stair stringers & carved marble posts
  [-2.55, 2.55].forEach((x) => {
    const stringer = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.28, 0.62, 5.05)),
      graniteMat,
    );
    stringer.position.set(x, 0.78, (stepsStartZ + stepsEndZ) / 2);
    stringer.rotation.x = Math.atan2(stepsTopY, stepsStartZ - stepsEndZ);
    scene.add(stringer);

    [
      { pz: stepsStartZ + 0.08, py: 0 },
      { pz: stepsEndZ - 0.05, py: stepsTopY },
    ].forEach((pt) => {
      const post = new THREE.Mesh(
        trackGeo(store, new THREE.BoxGeometry(0.26, 0.96, 0.26)),
        graniteMat,
      );
      post.position.set(x, pt.py + 0.48, pt.pz);
      const finial = new THREE.Mesh(
        trackGeo(store, new THREE.SphereGeometry(0.11, 10, 8)),
        graniteMat,
      );
      finial.position.set(x, pt.py + 1.0, pt.pz);
      scene.add(post, finial);
    });
  });

  // 3. Hall Stone Terrace Platform (月台: z = +2.6 -> -0.2, y = 1.05m) + Carved Front Balustrades
  const terrace = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(17.5, stepsTopY, 2.9)),
    graniteMat,
  );
  terrace.position.set(0, stepsTopY / 2, 1.2);
  scene.add(terrace);

  [-5.1, 5.1].forEach((bx) => {
    const span = buildBalustradeSpan(store, graniteMat, 4.9, 4);
    span.position.set(bx, stepsTopY, 2.52);
    scene.add(span);
  });

  // 4. Grand Portico Columns, Carved Architraves, Raftered Eaves & Hanging Lanterns
  const porticoColGeo = trackGeo(store, new THREE.CylinderGeometry(0.25, 0.28, 3.85, 20));
  const drumPlinthGeo = trackGeo(store, new THREE.CylinderGeometry(0.34, 0.39, 0.2, 20));
  const colPositions = [-4.45, -2.05, 2.05, 4.45];
  colPositions.forEach((x) => {
    const drum = new THREE.Mesh(drumPlinthGeo, graniteMat);
    drum.position.set(x, stepsTopY + 0.1, 1.58);
    const col = new THREE.Mesh(porticoColGeo, pillarMat);
    col.position.set(x, stepsTopY + 2.02, 1.58);
    // Decorative corbel / bracket capital block
    const capBlock = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.68, 0.28, 0.68)),
      darkTimberMat,
    );
    capBlock.position.set(x, stepsTopY + 3.88, 1.58);
    scene.add(drum, col, capBlock);
    addContactShadow(store, scene, texSet.contactShadowMap, x, stepsTopY, 1.58, 0.56, 0.56, 0.45);
  });

  // Horizontal architrave lintel & tie-beams overhead
  const frontBeam = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(12.6, 0.34, 0.42)),
    darkTimberMat,
  );
  frontBeam.position.set(0, stepsTopY + 3.72, 1.58);
  scene.add(frontBeam);

  // Projecting individual timber rafters (椽子) visible overhead as camera enters portico
  const rafterGeo = trackGeo(store, new THREE.BoxGeometry(0.09, 0.1, 2.95));
  for (let rx = -6.2; rx <= 6.2; rx += 0.44) {
    const rafter = new THREE.Mesh(rafterGeo, darkTimberMat);
    rafter.position.set(rx, stepsTopY + 4.12, 1.05);
    rafter.rotation.x = 0.2;
    scene.add(rafter);
  }

  // Overhanging lower glazed tile portico eave + gilded plaque frame above center span
  const porticoRoof = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(14.6, 0.22, 3.15)),
    roofMat,
  );
  porticoRoof.position.set(0, stepsTopY + 4.28, 1.05);
  porticoRoof.rotation.x = 0.2;
  scene.add(porticoRoof);

  // Upper main hall gable eave visible above portico from courtyard
  const upperWall = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(14.0, 2.2, 0.4)),
    darkTimberMat,
  );
  upperWall.position.set(0, stepsTopY + 5.2, 0.05);
  const upperRoof = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(16.2, 0.28, 3.8)),
    roofMat,
  );
  upperRoof.position.set(0, stepsTopY + 6.15, 0.6);
  upperRoof.rotation.x = 0.26;
  scene.add(upperWall, upperRoof);

  // Plaque (匾额) centered between central portico columns
  const plaqueOuter = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(2.35, 0.68, 0.14)),
    darkTimberMat,
  );
  plaqueOuter.position.set(0, stepsTopY + 3.5, 1.62);
  const plaqueGold = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(2.1, 0.48, 0.16)),
    goldTrimMat,
  );
  plaqueGold.position.set(0, stepsTopY + 3.5, 1.63);
  scene.add(plaqueOuter, plaqueGold);

  // Portico lanterns flanking central aisle
  [-1.78, 1.78].forEach((lx) => {
    const pLantern = buildPalaceLantern(store, tradition, false);
    pLantern.position.set(lx, stepsTopY + 3.45, 1.48);
    scene.add(pLantern);
  });

  // 5. Traditional Hall Front Wall Wings (Granite masonry lower wall + Carved Timber Lattice Windows)
  const doorZ = 0.0;
  const doorWidth = 2.76; // Clear doorway opening x in [-1.38, +1.38]
  const doorHeight = 3.15;

  [-4.45, 4.45].forEach((wx) => {
    // Lower stone knee-wall (槛墙)
    const kneeWall = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(5.8, 0.92, 0.44)),
      graniteMat,
    );
    kneeWall.position.set(wx, stepsTopY + 0.46, doorZ);
    // Upper carved timber lattice screen bays (格扇槛窗) using authentic carved door photography
    const screenBay = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(5.8, 2.55, 0.34)),
      doorMat,
    );
    screenBay.position.set(wx, stepsTopY + 2.18, doorZ);
    scene.add(kneeWall, screenBay);
  });

  // Wall transom above doorway
  const upperTransom = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(3.5, 0.85, 0.48)),
    darkTimberMat,
  );
  upperTransom.position.set(0, stepsTopY + doorHeight + 0.45, doorZ);
  scene.add(upperTransom);

  // 6. Physical Threshold Sill, Thick Stepped Doorjambs & Double Parting Lattice Doors
  const sill = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(doorWidth + 0.34, 0.17, 0.38)),
    darkTimberMat,
  );
  sill.position.set(0, stepsTopY + 0.085, doorZ);
  scene.add(sill);

  [-doorWidth / 2 - 0.16, doorWidth / 2 + 0.16].forEach((jx) => {
    const jamb = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.32, doorHeight + 0.36, 0.64)),
      darkTimberMat,
    );
    jamb.position.set(jx, stepsTopY + doorHeight / 2 + 0.08, doorZ);
    scene.add(jamb);
  });

  const lintel = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(doorWidth + 0.72, 0.44, 0.68)),
    darkTimberMat,
  );
  lintel.position.set(0, stepsTopY + doorHeight + 0.22, doorZ);
  scene.add(lintel);

  const leafWidth = doorWidth / 2 - 0.015;
  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-doorWidth / 2, stepsTopY + 0.16, doorZ - 0.05);
  const leftLeaf = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(leafWidth, doorHeight - 0.12, 0.08)),
    doorMat,
  );
  leftLeaf.position.set(leafWidth / 2, (doorHeight - 0.12) / 2, 0);
  leftDoorPivot.add(leftLeaf);
  scene.add(leftDoorPivot);

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(doorWidth / 2, stepsTopY + 0.16, doorZ - 0.05);
  const rightLeaf = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(leafWidth, doorHeight - 0.12, 0.08)),
    doorMat,
  );
  rightLeaf.position.set(-leafWidth / 2, (doorHeight - 0.12) / 2, 0);
  rightDoorPivot.add(rightLeaf);
  scene.add(rightDoorPivot);

  // 7. Continuous Deep Interior Sanctuary Hall (Real Jinzhuan Floor + Timber Bays + Hanging Lanterns)
  const hallFloorMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.hallFloorMap,
      bumpMap: texSet.hallFloorBump,
      bumpScale: 0.018,
      roughness: 0.34,
      metalness: 0.1,
      envMapIntensity: 0.72,
    }),
  );
  applyWorldSpaceGroundShader(hallFloorMat, {
    tradition,
    isInterior: true,
    contactZ: 0,
  });

  const interiorFloor = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(15, 13.5)),
    hallFloorMat,
  );
  interiorFloor.rotation.x = -Math.PI / 2;
  interiorFloor.position.set(0, stepsTopY + 0.006, -6.7);
  scene.add(interiorFloor);

  // Interior coffered beam ceiling & dark timber enclosure walls
  const ceiling = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(15, 13.5)),
    darkTimberMat,
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, stepsTopY + 4.55, -6.7);
  scene.add(ceiling);

  const sideWallGeo = trackGeo(store, new THREE.PlaneGeometry(13.5, 4.8));
  [-6.6, 6.6].forEach((wx, idx) => {
    const sw = new THREE.Mesh(sideWallGeo, darkTimberMat);
    sw.position.set(wx, stepsTopY + 2.25, -6.7);
    sw.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
    scene.add(sw);
  });

  // Interior timber bays matching exact real sanctuary proportions
  const intColGeo = trackGeo(store, new THREE.CylinderGeometry(0.23, 0.26, 4.65, 20));
  const intBeamGeo = trackGeo(store, new THREE.BoxGeometry(7.0, 0.3, 0.32));
  [-3.1, -6.8, -10.2].forEach((iz, bayIdx) => {
    [-3.1, 3.1].forEach((ix) => {
      const drum = new THREE.Mesh(drumPlinthGeo, graniteMat);
      drum.position.set(ix, stepsTopY + 0.1, iz);
      const col = new THREE.Mesh(intColGeo, pillarMat);
      col.position.set(ix, stepsTopY + 2.32, iz);
      scene.add(drum, col);
      addContactShadow(store, scene, texSet.contactShadowMap, ix, stepsTopY, iz, 0.52, 0.52, 0.48);
    });

    const crossBeam = new THREE.Mesh(intBeamGeo, darkTimberMat);
    crossBeam.position.set(0, stepsTopY + 4.32, iz);
    scene.add(crossBeam);

    if (bayIdx < 2) {
      [-2.15, 2.15].forEach((lx) => {
        const lantern = buildPalaceLantern(store, tradition, bayIdx === 0);
        lantern.position.set(lx, stepsTopY + 3.85, iz);
        scene.add(lantern);
      });
    }
  });

  // 8. Depth-Responsive Seamless Sanctuary Plane (Feathered edges + realistic indoor light adaptation)
  const sanctuaryMat = trackMat(
    store,
    new THREE.MeshBasicMaterial({
      map: interiorTex,
      alphaMap: texSet.sanctuaryFeatherAlpha,
      transparent: true,
      color: new THREE.Color(0x6d6157), // Shaded interior depth when viewed from bright courtyard
      fog: false,
    }),
  );
  const sanctuaryPlane = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(1, 1)),
    sanctuaryMat,
  );
  const cameraEndZ = -4.2;
  const cameraEndY = stepsTopY + 1.64; // 2.69m
  const sanctuaryZ = -11.4;
  sanctuaryPlane.position.set(0, cameraEndY, sanctuaryZ);
  scene.add(sanctuaryPlane);

  const motes = buildIncenseMotes(store, tradition, {
    xSpan: 7.5,
    yMin: 1.3,
    yMax: 4.1,
    zMin: -9.5,
    zMax: 10.0,
  });
  scene.add(motes);

  const cameraStartZ = 13.8;
  const cameraStartY = 1.64;

  return {
    scene,
    cameraStartZ,
    cameraStartY,
    cameraEndZ,
    cameraEndY,
    stepsStartZ,
    stepsEndZ,
    stepsTopY,
    doorZ,
    update: (progress: number, elapsedSec: number, viewportAspect: number) => {
      // Exact FOV 46° cover calculation at arrival z = -4.2 (distance 7.2m)
      const distAtArrival = Math.abs(cameraEndZ - sanctuaryZ);
      const visH =
        2 * distAtArrival * Math.tan(THREE.MathUtils.degToRad(46 / 2));
      const visW = visH * Math.max(viewportAspect, 1.0);
      sanctuaryPlane.scale.set(
        Math.max(visW * 1.04, visH * 1.78),
        visH * 1.04,
        1,
      );

      // Smooth eye-adaptation brightness & atmospheric clarity as crossing doorway
      const interiorVis =
        request.mode === "enter-hall"
          ? THREE.MathUtils.smoothstep(progress, 0.36, 0.84)
          : 1 - THREE.MathUtils.smoothstep(progress, 0.16, 0.64) * 0.58;
      const tone = THREE.MathUtils.lerp(0.42, 1.0, interiorVis);
      sanctuaryMat.color.setRGB(tone, tone, tone);
      fog.density = THREE.MathUtils.lerp(0.014, 0.0025, interiorVis);

      // Carved double doors smoothly swing inward
      let doorOpenFactor = 0;
      if (request.mode === "enter-hall") {
        doorOpenFactor = THREE.MathUtils.smoothstep(progress, 0.16, 0.52);
      } else {
        doorOpenFactor = 1 - THREE.MathUtils.smoothstep(progress, 0.65, 0.96) * 0.52;
      }
      const swingAngle =
        THREE.MathUtils.degToRad(16) +
        doorOpenFactor * THREE.MathUtils.degToRad(70);
      leftDoorPivot.rotation.y = swingAngle;
      rightDoorPivot.rotation.y = -swingAngle;

      motes.position.y = Math.sin(elapsedSec * 0.35) * 0.08;
    },
    dispose: () => {
      store.geometries.forEach((g) => g.dispose());
      store.materials.forEach((m) => m.dispose());
      store.textures.forEach((t) => t.dispose());
    },
  };
}

/**
 * 构建「寺院回廊青石路径 -> 传统重檐山门牌坊穿越 -> 目标殿宇前庭」真实 3D 漫步场景
 */
function buildCourtyardPassageScene(
  request: WalkRequest,
  texSet: WalkTextureSet,
  targetTex: THREE.Texture,
): BuiltWalkScene {
  const store: DisposableStore = {
    geometries: [],
    materials: [],
    textures: [targetTex],
  };

  const scene = new THREE.Scene();
  const tradition = request.tradition;
  const fog = new THREE.FogExp2(
    tradition === "daoist" ? 0x9eb4ae : 0xbcb0a1,
    0.015,
  );
  scene.fog = fog;

  scene.add(createSkyDome(store, texSet.skyGradMap));
  scene.add(buildLayeredMistyMountains(store, texSet, tradition));

  scene.add(
    new THREE.HemisphereLight(
      tradition === "daoist" ? 0xd9ece6 : 0xfff2dd,
      0x342c25,
      1.18,
    ),
  );
  const sun = new THREE.DirectionalLight(0xfff4de, 1.45);
  sun.position.set(12, 20, 14);
  scene.add(sun);

  const stoneMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.courtyardStoneMap,
      bumpMap: texSet.courtyardStoneBump,
      bumpScale: 0.032,
      color: tradition === "daoist" ? 0xdce4df : 0xe8e2d9,
      roughness: 0.84,
      metalness: 0.04,
      envMapIntensity: 0.45,
    }),
  );
  applyWorldSpaceGroundShader(stoneMat, {
    tradition,
    isInterior: false,
    contactZ: 2.2,
  });

  const graniteMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.graniteStepMap,
      bumpMap: texSet.graniteStepBump,
      bumpScale: 0.022,
      roughness: 0.78,
      metalness: 0.04,
    }),
  );

  const pillarMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.pillarWoodMap,
      color: tradition === "daoist" ? 0x628c80 : 0xdcbdb3,
      roughness: 0.46,
      metalness: 0.08,
    }),
  );

  const darkTimberMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.pillarWoodMap,
      color: tradition === "daoist" ? 0x4b5c56 : 0x7a5045,
      roughness: 0.54,
      metalness: 0.08,
    }),
  );

  const roofMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.roofTileMap,
      bumpMap: texSet.roofTileBump,
      bumpScale: 0.03,
      roughness: 0.44,
      metalness: 0.22,
    }),
  );

  // Continuous real bluestone courtyard path
  const ground = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(38, 36)),
    stoneMat,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 4);
  scene.add(ground);

  // Flanking covered monastery corridor galleries (廊柱 + 柱础 + 座栏 + 屋檐)
  const colGeo = trackGeo(store, new THREE.CylinderGeometry(0.18, 0.21, 3.65, 16));
  const plinthGeo = trackGeo(store, new THREE.CylinderGeometry(0.27, 0.31, 0.18, 16));
  for (let z = 13.5; z >= -3.5; z -= 3.4) {
    [-4.8, 4.8].forEach((x) => {
      const base = new THREE.Mesh(plinthGeo, graniteMat);
      base.position.set(x, 0.09, z);
      const col = new THREE.Mesh(colGeo, pillarMat);
      col.position.set(x, 2.0, z);
      scene.add(base, col);
      addContactShadow(store, scene, texSet.contactShadowMap, x, 0, z, 0.48, 0.48, 0.42);
    });
  }
  [-4.8, 4.8].forEach((x) => {
    const beam = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.36, 0.32, 19)),
      darkTimberMat,
    );
    beam.position.set(x, 3.92, 5);
    const roof = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(2.2, 0.18, 19.5)),
      roofMat,
    );
    roof.position.set(x + (x < 0 ? -0.4 : 0.4), 4.22, 5);
    roof.rotation.z = x < 0 ? -0.24 : 0.24;
    scene.add(beam, roof);
  });

  // Stone lanterns along courtyard walkway
  [10.2, 5.2, -1.5].forEach((z, idx) => {
    [-2.75, 2.75].forEach((x) => {
      const l = buildStoneLantern(store, texSet, tradition, idx !== 1);
      l.position.set(x, 0, z);
      scene.add(l);
    });
  });

  // Organic flanking pine trees
  [
    { x: -7.5, z: 10.5, s: 1.05 },
    { x: 7.5, z: 10.5, s: 1.1 },
    { x: -7.8, z: 3.0, s: 1.15 },
    { x: 7.8, z: 3.0, s: 1.12 },
    { x: -8.2, z: -4.2, s: 1.2 },
    { x: 8.2, z: -4.2, s: 1.18 },
  ].forEach((t) => {
    const tree = buildOrganicPineTree(store, texSet, tradition, t.s);
    tree.position.set(t.x, 0, t.z);
    scene.add(tree);
  });

  // Traditional Archway Gate at z = +2.2 (physically walked through at Stage 4)
  const gateZ = 2.2;
  [-1.65, 1.65].forEach((x) => {
    const plinth = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.62, 0.34, 0.62)),
      graniteMat,
    );
    plinth.position.set(x, 0.17, gateZ);
    const col = new THREE.Mesh(
      trackGeo(store, new THREE.CylinderGeometry(0.23, 0.26, 3.85, 18)),
      pillarMat,
    );
    col.position.set(x, 2.1, gateZ);
    scene.add(plinth, col);
    addContactShadow(store, scene, texSet.contactShadowMap, x, 0, gateZ, 0.6, 0.6, 0.5);
  });

  // Gate flanking masonry walls
  [-4.2, 4.2].forEach((wx) => {
    const wallBase = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(4.5, 2.8, 0.42)),
      graniteMat,
    );
    wallBase.position.set(wx, 1.4, gateZ);
    scene.add(wallBase);
  });

  // Gate timber lintel + underside rafters + tiled roof
  const gateLintel = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(4.1, 0.48, 0.58)),
    darkTimberMat,
  );
  gateLintel.position.set(0, 3.55, gateZ);
  for (let rx = -2.8; rx <= 2.8; rx += 0.42) {
    const raf = new THREE.Mesh(
      trackGeo(store, new THREE.BoxGeometry(0.08, 0.09, 2.1)),
      darkTimberMat,
    );
    raf.position.set(rx, 3.92, gateZ);
    scene.add(raf);
  }
  const gateRoof = new THREE.Mesh(
    trackGeo(store, new THREE.BoxGeometry(6.6, 0.24, 2.35)),
    roofMat,
  );
  gateRoof.position.set(0, 4.08, gateZ);
  scene.add(gateLintel, gateRoof);

  // Target Hall Vista Plane at z = -11.0 (arrival z = -3.8 -> dist 7.2m)
  const targetMat = trackMat(
    store,
    new THREE.MeshBasicMaterial({
      map: targetTex,
      alphaMap: texSet.sanctuaryFeatherAlpha,
      transparent: true,
      color: new THREE.Color(0x9a8f85),
      fog: false,
    }),
  );
  const targetPlane = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(1, 1)),
    targetMat,
  );
  const cameraEndZ = -3.8;
  const targetZ = -11.0;
  targetPlane.position.set(0, 1.64, targetZ);
  scene.add(targetPlane);

  const motes = buildIncenseMotes(store, tradition, {
    xSpan: 7.5,
    yMin: 0.4,
    yMax: 3.8,
    zMin: -8,
    zMax: 12,
  });
  scene.add(motes);

  return {
    scene,
    cameraStartZ: 13.5,
    cameraStartY: 1.64,
    cameraEndZ,
    cameraEndY: 1.64,
    stepsStartZ: 0,
    stepsEndZ: 0,
    stepsTopY: 0,
    doorZ: gateZ,
    update: (progress: number, elapsedSec: number, viewportAspect: number) => {
      const distAtArrival = Math.abs(cameraEndZ - targetZ);
      const visH =
        2 * distAtArrival * Math.tan(THREE.MathUtils.degToRad(46 / 2));
      const visW = visH * Math.max(viewportAspect, 1.0);
      targetPlane.scale.set(
        Math.max(visW * 1.04, visH * 1.78),
        visH * 1.04,
        1,
      );

      const reveal = THREE.MathUtils.smoothstep(progress, 0.42, 0.88);
      const tone = THREE.MathUtils.lerp(0.68, 1.0, reveal);
      targetMat.color.setRGB(tone, tone, tone);
      fog.density = THREE.MathUtils.lerp(0.015, 0.002, reveal);

      motes.position.y = Math.sin(elapsedSec * 0.35) * 0.1;
    },
    dispose: () => {
      store.geometries.forEach((g) => g.dispose());
      store.materials.forEach((m) => m.dispose());
      store.textures.forEach((t) => t.dispose());
    },
  };
}

/**
 * 构建「山林青苔步石小径 -> 溪涧竹影掩映 -> 静修山水境域」3D 自然步行场景
 */
function buildNatureTrailScene(
  request: WalkRequest,
  texSet: WalkTextureSet,
  targetTex: THREE.Texture,
): BuiltWalkScene {
  const store: DisposableStore = {
    geometries: [],
    materials: [],
    textures: [targetTex],
  };

  const scene = new THREE.Scene();
  const tradition = request.tradition;
  const fog = new THREE.FogExp2(0x8fa8a4, 0.016);
  scene.fog = fog;

  scene.add(createSkyDome(store, texSet.skyGradMap));
  scene.add(buildLayeredMistyMountains(store, texSet, tradition));

  scene.add(new THREE.HemisphereLight(0xcbe6df, 0x26332c, 1.2));
  const sun = new THREE.DirectionalLight(0xf2faf6, 1.38);
  sun.position.set(14, 20, 12);
  scene.add(sun);

  // Mossy natural forest earth (world-space shader breakup, zero flat plastic look)
  const earthMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.courtyardStoneMap,
      bumpMap: texSet.courtyardStoneBump,
      bumpScale: 0.035,
      color: 0x526352,
      roughness: 0.92,
      metalness: 0.02,
      envMapIntensity: 0.3,
    }),
  );
  applyWorldSpaceGroundShader(earthMat, {
    tradition: "nature",
    isInterior: false,
    contactZ: 2.0,
    mossStrength: 0.55,
  });

  const ground = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(44, 38)),
    earthMat,
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, 0, 4);
  scene.add(ground);

  // Rippling mountain stream ribbon alongside stepping path
  const waterMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.waterRippleMap,
      roughness: 0.16,
      metalness: 0.52,
      transparent: true,
      opacity: 0.86,
      envMapIntensity: 0.9,
    }),
  );
  const stream = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(4.8, 34)),
    waterMat,
  );
  stream.rotation.x = -Math.PI / 2;
  stream.position.set(4.1, 0.02, 4);
  scene.add(stream);

  // Natural weathered stone stepping slabs along winding mountain path
  const stoneSlabMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.graniteStepMap,
      bumpMap: texSet.graniteStepBump,
      bumpScale: 0.025,
      color: 0x9aa39b,
      roughness: 0.84,
      metalness: 0.03,
    }),
  );
  const slabGeo = trackGeo(store, new THREE.CylinderGeometry(0.56, 0.64, 0.09, 9));
  for (let z = 13.0; z >= -3.5; z -= 1.05) {
    const xOff = Math.sin(z * 0.25) * 0.18;
    const slab = new THREE.Mesh(slabGeo, stoneSlabMat);
    slab.scale.set(1.22, 1, 0.82);
    slab.rotation.y = (z * 0.7) % Math.PI;
    slab.position.set(xOff, 0.045, z);
    scene.add(slab);
    addContactShadow(store, scene, texSet.contactShadowMap, xOff, 0, z, 0.72, 0.52, 0.4);
  }

  // Organic bamboo culms + natural leaf cluster cards arching softly over the path
  const bambooCulmMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      color: 0x456948,
      roughness: 0.56,
      metalness: 0.04,
    }),
  );
  const bambooLeafMat = trackMat(
    store,
    new THREE.MeshStandardMaterial({
      map: texSet.bambooLeafMap,
      alphaTest: 0.25,
      side: THREE.DoubleSide,
      roughness: 0.75,
    }),
  );
  const stalkGeo = trackGeo(store, new THREE.CylinderGeometry(0.045, 0.068, 5.8, 8));
  const leafCardGeo = trackGeo(store, new THREE.PlaneGeometry(2.2, 2.2));
  const stalkCount = 34;
  const bambooInst = new THREE.InstancedMesh(stalkGeo, bambooCulmMat, stalkCount);
  const dummy = new THREE.Object3D();

  for (let i = 0; i < stalkCount; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const z = 13.0 - Math.floor(i / 2) * 1.02;
    const pinch = Math.abs(z - 2.2) < 1.8 ? 1.48 : 2.25;
    const x = side * (pinch + (i % 4) * 0.38);
    dummy.position.set(x, 2.85, z);
    dummy.rotation.z = side * (Math.abs(z - 2.2) < 1.8 ? 0.14 : 0.05);
    dummy.rotation.x = ((i % 3) - 1) * 0.03;
    dummy.scale.setScalar(0.88 + (i % 3) * 0.11);
    dummy.updateMatrix();
    bambooInst.setMatrixAt(i, dummy.matrix);

    if (i % 3 === 0) {
      const card = new THREE.Mesh(leafCardGeo, bambooLeafMat);
      card.position.set(x * 0.85, 3.2 + (i % 2) * 0.5, z);
      card.rotation.y = (i * 0.9) % Math.PI;
      scene.add(card);
    }
  }
  bambooInst.computeBoundingSphere();
  scene.add(bambooInst);

  // Target Nature Retreat Vista Plane
  const targetMat = trackMat(
    store,
    new THREE.MeshBasicMaterial({
      map: targetTex,
      alphaMap: texSet.sanctuaryFeatherAlpha,
      transparent: true,
      color: new THREE.Color(0xa6b3ae),
      fog: false,
    }),
  );
  const targetPlane = new THREE.Mesh(
    trackGeo(store, new THREE.PlaneGeometry(1, 1)),
    targetMat,
  );
  const cameraEndZ = -3.8;
  const targetZ = -11.0;
  targetPlane.position.set(0, 1.64, targetZ);
  scene.add(targetPlane);

  const motes = buildIncenseMotes(store, tradition, {
    xSpan: 8,
    yMin: 0.4,
    yMax: 3.8,
    zMin: -8,
    zMax: 12,
  });
  scene.add(motes);

  return {
    scene,
    cameraStartZ: 13.5,
    cameraStartY: 1.64,
    cameraEndZ,
    cameraEndY: 1.64,
    stepsStartZ: 0,
    stepsEndZ: 0,
    stepsTopY: 0,
    doorZ: 2.2,
    update: (progress: number, elapsedSec: number, viewportAspect: number) => {
      const distAtArrival = Math.abs(cameraEndZ - targetZ);
      const visH =
        2 * distAtArrival * Math.tan(THREE.MathUtils.degToRad(46 / 2));
      const visW = visH * Math.max(viewportAspect, 1.0);
      targetPlane.scale.set(
        Math.max(visW * 1.04, visH * 1.78),
        visH * 1.04,
        1,
      );

      const reveal = THREE.MathUtils.smoothstep(progress, 0.44, 0.88);
      const tone = THREE.MathUtils.lerp(0.74, 1.0, reveal);
      targetMat.color.setRGB(tone, tone, tone);
      fog.density = THREE.MathUtils.lerp(0.016, 0.002, reveal);

      texSet.waterRippleMap.offset.y = -(elapsedSec * 0.04) % 1;
      motes.position.y = Math.sin(elapsedSec * 0.35) * 0.1;
    },
    dispose: () => {
      store.geometries.forEach((g) => g.dispose());
      store.materials.forEach((m) => m.dispose());
      store.textures.forEach((t) => t.dispose());
    },
  };
}

export function buildWalkScene(
  request: WalkRequest,
  texSet: WalkTextureSet,
  exteriorTex: THREE.Texture,
  interiorTex: THREE.Texture,
  targetTex: THREE.Texture,
): BuiltWalkScene {
  if (request.mode === "enter-hall" || request.mode === "exit-hall") {
    return buildHallEntryExitScene(request, texSet, exteriorTex, interiorTex);
  }
  if (request.mode === "trail-walk") {
    return buildNatureTrailScene(request, texSet, targetTex);
  }
  return buildCourtyardPassageScene(request, texSet, targetTex);
}
