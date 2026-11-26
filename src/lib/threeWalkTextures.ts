import * as THREE from "three";
import hallJinzhuanFloorImg from "@/assets/images/hall_jinzhuan_floor_1795723003381.jpg";
import templeCarvedDoorImg from "@/assets/images/temple_carved_door_1795723005000.jpg";
import templeLacquerWoodImg from "@/assets/images/temple_lacquer_wood_1795723003443.jpg";
import templeStonePavingImg from "@/assets/images/temple_stone_paving_1795723003054.jpg";
import type { WalkTradition } from "@/data/walkProfiles";

export type WalkTextureSet = {
  textures: THREE.Texture[];
  courtyardStoneMap: THREE.Texture;
  courtyardStoneBump: THREE.CanvasTexture;
  hallFloorMap: THREE.Texture;
  hallFloorBump: THREE.CanvasTexture;
  graniteStepMap: THREE.CanvasTexture;
  graniteStepBump: THREE.CanvasTexture;
  pillarWoodMap: THREE.Texture;
  doorPanelMap: THREE.Texture;
  roofTileMap: THREE.CanvasTexture;
  roofTileBump: THREE.CanvasTexture;
  skyGradMap: THREE.CanvasTexture;
  waterRippleMap: THREE.CanvasTexture;
  foliageBoughMap: THREE.CanvasTexture;
  bambooLeafMap: THREE.CanvasTexture;
  contactShadowMap: THREE.CanvasTexture;
  sanctuaryFeatherAlpha: THREE.CanvasTexture;
  mountainRidgeMap: THREE.CanvasTexture;
  dispose: () => void;
};

function makeCanvas(
  w: number,
  h: number,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("2D canvas context unavailable");
  }
  return [canvas, ctx];
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  anisotropy: number,
  options: {
    srgb?: boolean;
    repeatX?: number;
    repeatY?: number;
    wrap?: THREE.Wrapping;
  } = {},
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace =
    options.srgb !== false ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = Math.max(1, Math.min(16, anisotropy));
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  if (options.repeatX || options.repeatY) {
    tex.wrapS = options.wrap ?? THREE.RepeatWrapping;
    tex.wrapT = options.wrap ?? THREE.RepeatWrapping;
    tex.repeat.set(options.repeatX ?? 1, options.repeatY ?? 1);
  }
  tex.needsUpdate = true;
  return tex;
}

/**
 * 从真实照片纹理自动提取匹配的灰度凹凸/粗糙微结构贴图（零假线条）
 */
function createDerivedBumpCanvas(size = 512): [HTMLCanvasElement, THREE.CanvasTexture] {
  const [canvas, ctx] = makeCanvas(size, size);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  const bumpTex = new THREE.CanvasTexture(canvas);
  bumpTex.colorSpace = THREE.NoColorSpace;
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.wrapT = THREE.RepeatWrapping;
  bumpTex.minFilter = THREE.LinearMipmapLinearFilter;
  bumpTex.magFilter = THREE.LinearFilter;
  return [canvas, bumpTex];
}

function populateBumpFromImage(
  img: CanvasImageSource,
  canvas: HTMLCanvasElement,
  bumpTex: THREE.CanvasTexture,
  contrast = 1.45,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.drawImage(img, 0, 0, w, h);
  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const lum =
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const v = Math.max(
        0,
        Math.min(255, Math.round((lum - 128) * contrast + 128)),
      );
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    bumpTex.needsUpdate = true;
  } catch {
    // Keep neutral bump if canvas pixel read is blocked
  }
}

function loadPhotoTextureWithBump(
  url: string,
  anisotropy: number,
  options: {
    repeatX?: number;
    repeatY?: number;
    wrap?: THREE.Wrapping;
    deriveBump?: boolean;
    bumpContrast?: number;
  } = {},
): { map: THREE.Texture; bump?: THREE.CanvasTexture } {
  const loader = new THREE.TextureLoader();
  let bumpTuple: [HTMLCanvasElement, THREE.CanvasTexture] | undefined;
  if (options.deriveBump) {
    bumpTuple = createDerivedBumpCanvas(512);
    if (options.repeatX || options.repeatY) {
      bumpTuple[1].repeat.set(options.repeatX ?? 1, options.repeatY ?? 1);
    }
    bumpTuple[1].anisotropy = Math.max(1, Math.min(16, anisotropy));
  }

  const map = loader.load(url, (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.anisotropy = Math.max(1, Math.min(16, anisotropy));
    loaded.minFilter = THREE.LinearMipmapLinearFilter;
    loaded.magFilter = THREE.LinearFilter;
    loaded.needsUpdate = true;
    if (bumpTuple && loaded.image) {
      populateBumpFromImage(
        loaded.image as CanvasImageSource,
        bumpTuple[0],
        bumpTuple[1],
        options.bumpContrast ?? 1.5,
      );
    }
  });

  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = Math.max(1, Math.min(16, anisotropy));
  map.minFilter = THREE.LinearMipmapLinearFilter;
  map.magFilter = THREE.LinearFilter;
  if (options.repeatX || options.repeatY) {
    map.wrapS = options.wrap ?? THREE.RepeatWrapping;
    map.wrapT = options.wrap ?? THREE.RepeatWrapping;
    map.repeat.set(options.repeatX ?? 1, options.repeatY ?? 1);
  }

  return { map, bump: bumpTuple?.[1] };
}

/**
 * 世界空间防重复宏观变化着色器（消除大面积地面纹理周期性重复感，增加天然风化与边缘接触暗影）
 */
export function applyWorldSpaceGroundShader(
  material: THREE.MeshStandardMaterial,
  options: {
    tradition: WalkTradition;
    isInterior?: boolean;
    contactZ?: number;
    mossStrength?: number;
  },
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMossStrength = {
      value: options.mossStrength ?? (options.tradition === "buddhist" ? 0.08 : 0.22),
    };
    shader.uniforms.uIsInterior = { value: options.isInterior ? 1.0 : 0.0 };
    shader.uniforms.uContactZ = { value: options.contactZ ?? 2.6 };

    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vWalkWorldPos;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 walkWp = modelMatrix * vec4(transformed, 1.0);
        vWalkWorldPos = walkWp.xyz;`,
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vWalkWorldPos;
        uniform float uMossStrength;
        uniform float uIsInterior;
        uniform float uContactZ;

        float walkHash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }
        float walkNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(walkHash(i + vec2(0.0, 0.0)), walkHash(i + vec2(1.0, 0.0)), u.x),
            mix(walkHash(i + vec2(0.0, 1.0)), walkHash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float macroA = walkNoise(vWalkWorldPos.xz * 0.28);
        float macroB = walkNoise(vWalkWorldPos.xz * 0.78 + vec2(7.3, 13.1));
        float detailN = walkNoise(vWalkWorldPos.xz * 2.4);
        float macroTone = mix(0.86, 1.11, macroA * 0.65 + macroB * 0.35);
        diffuseColor.rgb *= macroTone;

        // Subtle warm/cool mineral patina & central foot-worn brightness
        float centerWear = exp(-pow(vWalkWorldPos.x * 0.28, 2.0));
        diffuseColor.rgb *= mix(0.92, 1.04, centerWear);

        if (uIsInterior < 0.5) {
          // Subtle dry moss/weathering toward outer flanks away from center walkway
          float flankRatio = smoothstep(2.4, 7.2, abs(vWalkWorldPos.x));
          float mossMask = flankRatio * smoothstep(0.45, 0.82, macroB) * uMossStrength;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.24, 0.29, 0.22), mossMask);

          // Soft ambient occlusion where courtyard stones meet terrace / steps / side colonnades
          float stepContact = 1.0 - 0.22 * exp(-pow((vWalkWorldPos.z - uContactZ) * 0.85, 2.0));
          float sideContact = 1.0 - 0.16 * smoothstep(5.4, 7.4, abs(vWalkWorldPos.x));
          diffuseColor.rgb *= stepContact * sideContact;
        } else {
          // Inside hall: subtle soft specular reflection path along center Jinzhuan tiles
          float aisleTone = mix(0.86, 1.06, centerWear * (0.8 + 0.2 * detailN));
          diffuseColor.rgb *= aisleTone;
        }`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        float rMacro = walkNoise(vWalkWorldPos.xz * 0.42 + vec2(4.1, 9.7));
        float aislePolish = exp(-pow(vWalkWorldPos.x * 0.35, 2.0));
        if (uIsInterior > 0.5) {
          roughnessFactor *= mix(0.95, 0.72, aislePolish * rMacro);
        } else {
          roughnessFactor *= mix(0.84, 1.12, rMacro) * mix(0.98, 0.88, aislePolish);
        }`,
      );
  };
  material.customProgramCacheKey = () =>
    `walk-ground-${options.tradition}-${options.isInterior ? "int" : "ext"}`;
}

/**
 * 为全项目 3D 漫游生成与加载摄影级材质纹理集
 */
export function createWalkTextureSet(
  tradition: WalkTradition,
  maxAnisotropy: number,
): WalkTextureSet {
  const textures: THREE.Texture[] = [];

  // 1. Real Photorealistic Courtyard Stone Slabs (摄影级青石板地面 + 自衍生真实凹凸)
  const stoneLoaded = loadPhotoTextureWithBump(
    templeStonePavingImg,
    maxAnisotropy,
    {
      repeatX: 7.5,
      repeatY: 9.5,
      deriveBump: true,
      bumpContrast: 1.7,
    },
  );
  const courtyardStoneMap = stoneLoaded.map;
  const courtyardStoneBump = stoneLoaded.bump!;
  textures.push(courtyardStoneMap, courtyardStoneBump);

  // 2. Real Photorealistic Hall Jinzhuan Stone Floor (殿内真实金砖石板 + 自衍生凹凸)
  const floorLoaded = loadPhotoTextureWithBump(
    hallJinzhuanFloorImg,
    maxAnisotropy,
    {
      repeatX: 4.5,
      repeatY: 4.5,
      deriveBump: true,
      bumpContrast: 1.5,
    },
  );
  const hallFloorMap = floorLoaded.map;
  const hallFloorBump = floorLoaded.bump!;
  textures.push(hallFloorMap, hallFloorBump);

  // 3. Real Photorealistic Timber Lacquer Pillar Texture (真实寺院木柱纹理)
  const woodLoaded = loadPhotoTextureWithBump(
    templeLacquerWoodImg,
    maxAnisotropy,
    {
      repeatX: 1,
      repeatY: 1,
    },
  );
  const pillarWoodMap = woodLoaded.map;
  textures.push(pillarWoodMap);

  // 4. Real Photorealistic Carved Lattice Door Leaf Texture (真实寺院格扇门雕花门扇)
  const doorLoaded = loadPhotoTextureWithBump(
    templeCarvedDoorImg,
    maxAnisotropy,
    {
      repeatX: 1,
      repeatY: 1,
    },
  );
  const doorPanelMap = doorLoaded.map;
  textures.push(doorPanelMap);

  // 5. Fine-grained White-Grey Granite / Hanbaiyu Marble for Steps, Terrace & Balustrades
  const [graniteCanvas, graniteCtx] = makeCanvas(512, 512);
  const [graniteBumpCanvas, graniteBumpCtx] = makeCanvas(512, 512);
  graniteCtx.fillStyle =
    tradition === "daoist" ? "#b9c1bc" : "#c7bfb2";
  graniteCtx.fillRect(0, 0, 512, 512);
  graniteBumpCtx.fillStyle = "#808080";
  graniteBumpCtx.fillRect(0, 0, 512, 512);

  // Deterministic organic mineral grain (no grids!)
  let seed = 48271;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 4800; i += 1) {
    const x = rand() * 512;
    const y = rand() * 512;
    const r = 0.8 + rand() * 2.4;
    const dark = rand() > 0.45;
    graniteCtx.fillStyle = dark
      ? `rgba(62, 58, 52, ${0.05 + rand() * 0.08})`
      : `rgba(255, 252, 245, ${0.06 + rand() * 0.09})`;
    graniteCtx.beginPath();
    graniteCtx.arc(x, y, r, 0, Math.PI * 2);
    graniteCtx.fill();

    graniteBumpCtx.fillStyle = dark
      ? `rgba(40, 40, 40, ${0.14 + rand() * 0.14})`
      : `rgba(220, 220, 220, ${0.14 + rand() * 0.14})`;
    graniteBumpCtx.beginPath();
    graniteBumpCtx.arc(x, y, r, 0, Math.PI * 2);
    graniteBumpCtx.fill();
  }
  // Soft stone weathering veins
  for (let v = 0; v < 26; v += 1) {
    graniteCtx.strokeStyle = `rgba(92, 86, 78, ${0.04 + rand() * 0.05})`;
    graniteCtx.lineWidth = 1 + rand() * 2.5;
    graniteCtx.beginPath();
    let vx = rand() * 512;
    let vy = rand() * 512;
    graniteCtx.moveTo(vx, vy);
    for (let s = 0; s < 5; s += 1) {
      vx += (rand() - 0.5) * 90;
      vy += (rand() - 0.5) * 45;
      graniteCtx.lineTo(vx, vy);
    }
    graniteCtx.stroke();
  }

  const graniteStepMap = finalizeTexture(graniteCanvas, maxAnisotropy, {
    srgb: true,
    repeatX: 2.5,
    repeatY: 1.5,
  });
  const graniteStepBump = finalizeTexture(graniteBumpCanvas, maxAnisotropy, {
    srgb: false,
    repeatX: 2.5,
    repeatY: 1.5,
  });
  textures.push(graniteStepMap, graniteStepBump);

  // 6. Glazed Cylindrical Chinese Roof Tile Texture (琉璃筒瓦立体渐变与高低凹凸)
  const [roofCanvas, roofCtx] = makeCanvas(512, 512);
  const [roofBumpCanvas, roofBumpCtx] = makeCanvas(512, 512);
  const tileCols = 16;
  const tileW = 512 / tileCols;
  for (let c = 0; c < tileCols; c += 1) {
    const x0 = c * tileW;
    const g = roofCtx.createLinearGradient(x0, 0, x0 + tileW, 0);
    if (tradition === "daoist") {
      g.addColorStop(0, "#102825");
      g.addColorStop(0.28, "#1e4b45");
      g.addColorStop(0.5, "#327067");
      g.addColorStop(0.75, "#1a413b");
      g.addColorStop(1, "#0d201d");
    } else {
      g.addColorStop(0, "#1d2224");
      g.addColorStop(0.28, "#314543");
      g.addColorStop(0.5, "#4c6864");
      g.addColorStop(0.75, "#2b3e3c");
      g.addColorStop(1, "#161c1d");
    }
    roofCtx.fillStyle = g;
    roofCtx.fillRect(x0, 0, tileW + 1, 512);

    const bg = roofBumpCtx.createLinearGradient(x0, 0, x0 + tileW, 0);
    bg.addColorStop(0, "#242424");
    bg.addColorStop(0.5, "#f0f0f0");
    bg.addColorStop(1, "#242424");
    roofBumpCtx.fillStyle = bg;
    roofBumpCtx.fillRect(x0, 0, tileW + 1, 512);
  }
  for (let y = 0; y < 512; y += 32) {
    roofCtx.fillStyle = "rgba(0,0,0,0.22)";
    roofCtx.fillRect(0, y, 512, 4);
    roofBumpCtx.fillStyle = "#323232";
    roofBumpCtx.fillRect(0, y, 512, 4);
  }
  const roofTileMap = finalizeTexture(roofCanvas, maxAnisotropy, {
    srgb: true,
    repeatX: 6,
    repeatY: 2.5,
  });
  const roofTileBump = finalizeTexture(roofBumpCanvas, maxAnisotropy, {
    srgb: false,
    repeatX: 6,
    repeatY: 2.5,
  });
  textures.push(roofTileMap, roofTileBump);

  // 7. Natural Sky Atmospheric Gradient Dome
  const [skyCanvas, skyCtx] = makeCanvas(64, 512);
  const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
  if (tradition === "buddhist") {
    skyGrad.addColorStop(0, "#4c6c8e");
    skyGrad.addColorStop(0.32, "#7e9bb5");
    skyGrad.addColorStop(0.56, "#c2ced3");
    skyGrad.addColorStop(0.74, "#e7dcc7");
    skyGrad.addColorStop(1, "#d9c6aa");
  } else if (tradition === "daoist") {
    skyGrad.addColorStop(0, "#3d5e66");
    skyGrad.addColorStop(0.34, "#74989a");
    skyGrad.addColorStop(0.58, "#b7ccc7");
    skyGrad.addColorStop(0.78, "#dce5df");
    skyGrad.addColorStop(1, "#cad7d0");
  } else {
    skyGrad.addColorStop(0, "#35535b");
    skyGrad.addColorStop(0.35, "#688c8c");
    skyGrad.addColorStop(0.62, "#a9c2bc");
    skyGrad.addColorStop(0.84, "#d2e0da");
    skyGrad.addColorStop(1, "#bdd0c9");
  }
  skyCtx.fillStyle = skyGrad;
  skyCtx.fillRect(0, 0, 64, 512);
  const skyGradMap = finalizeTexture(skyCanvas, 1, { srgb: true });
  textures.push(skyGradMap);

  // 8. Water Stream Ripple Texture
  const [waterCanvas, waterCtx] = makeCanvas(256, 256);
  waterCtx.fillStyle = "#284243";
  waterCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i += 1) {
    const wx = rand() * 256;
    const wy = rand() * 256;
    const ww = 28 + rand() * 68;
    waterCtx.fillStyle = `rgba(195, 228, 224, ${0.06 + rand() * 0.08})`;
    waterCtx.fillRect(wx, wy, ww, 2);
  }
  const waterRippleMap = finalizeTexture(waterCanvas, maxAnisotropy, {
    srgb: true,
    repeatX: 3,
    repeatY: 7,
  });
  textures.push(waterRippleMap);

  // 9. Organic Pine / Cypress Bough Alpha Texture (替代低多边形圆锥树冠)
  const [boughCanvas, boughCtx] = makeCanvas(512, 512);
  boughCtx.clearRect(0, 0, 512, 512);
  // Central dark wood branchlets
  boughCtx.strokeStyle = "#3a2a1e";
  boughCtx.lineWidth = 6;
  boughCtx.beginPath();
  boughCtx.moveTo(256, 460);
  boughCtx.quadraticCurveTo(250, 290, 256, 170);
  boughCtx.moveTo(254, 340);
  boughCtx.quadraticCurveTo(165, 290, 95, 260);
  boughCtx.moveTo(258, 320);
  boughCtx.quadraticCurveTo(350, 275, 420, 248);
  boughCtx.stroke();

  const pineClusters = [
    { x: 256, y: 175, rx: 120, ry: 72 },
    { x: 155, y: 235, rx: 105, ry: 64 },
    { x: 356, y: 230, rx: 105, ry: 64 },
    { x: 112, y: 315, rx: 95, ry: 58 },
    { x: 398, y: 308, rx: 95, ry: 58 },
    { x: 256, y: 295, rx: 135, ry: 76 },
  ];
  pineClusters.forEach((cl) => {
    for (let n = 0; n < 180; n += 1) {
      const a = rand() * Math.PI * 2;
      const dist = Math.sqrt(rand());
      const nx = cl.x + Math.cos(a) * cl.rx * dist;
      const ny = cl.y + Math.sin(a) * cl.ry * dist;
      const len = 10 + rand() * 16;
      const na = a + (rand() - 0.5) * 0.5;
      const shade = rand();
      boughCtx.strokeStyle =
        tradition === "daoist"
          ? shade > 0.65
            ? "#3f6841"
            : shade > 0.3
              ? "#294b2d"
              : "#1a331f"
          : shade > 0.65
            ? "#4a6c3a"
            : shade > 0.3
              ? "#2e4b27"
              : "#1c311a";
      boughCtx.lineWidth = 2.2;
      boughCtx.beginPath();
      boughCtx.moveTo(nx, ny);
      boughCtx.lineTo(nx + Math.cos(na) * len, ny + Math.sin(na) * len * 0.75);
      boughCtx.stroke();
    }
  });
  const foliageBoughMap = finalizeTexture(boughCanvas, maxAnisotropy, {
    srgb: true,
  });
  textures.push(foliageBoughMap);

  // 10. Bamboo Leaf Cluster Alpha Texture (用于山林漫游竹叶掩映)
  const [bambooCanvas, bambooCtx] = makeCanvas(512, 512);
  bambooCtx.clearRect(0, 0, 512, 512);
  for (let i = 0; i < 140; i += 1) {
    const bx = 65 + rand() * 380;
    const by = 55 + rand() * 390;
    const ang = (rand() - 0.5) * 1.4 + (bx < 256 ? -0.45 : 0.45);
    const len = 34 + rand() * 42;
    const wid = 5 + rand() * 5;
    bambooCtx.save();
    bambooCtx.translate(bx, by);
    bambooCtx.rotate(ang);
    bambooCtx.fillStyle =
      rand() > 0.55 ? "#4a7846" : rand() > 0.25 ? "#335933" : "#223f25";
    bambooCtx.beginPath();
    bambooCtx.ellipse(0, 0, len * 0.5, wid * 0.5, 0, 0, Math.PI * 2);
    bambooCtx.fill();
    bambooCtx.restore();
  }
  const bambooLeafMap = finalizeTexture(bambooCanvas, maxAnisotropy, {
    srgb: true,
  });
  textures.push(bambooLeafMap);

  // 11. Soft Contact Shadow Radial Decal (防止石灯、香炉、月台漂浮)
  const [shadowCanvas, shadowCtx] = makeCanvas(256, 256);
  const sg = shadowCtx.createRadialGradient(128, 128, 8, 128, 128, 124);
  sg.addColorStop(0, "rgba(10, 8, 6, 0.58)");
  sg.addColorStop(0.45, "rgba(10, 8, 6, 0.28)");
  sg.addColorStop(1, "rgba(10, 8, 6, 0.0)");
  shadowCtx.fillStyle = sg;
  shadowCtx.fillRect(0, 0, 256, 256);
  const contactShadowMap = finalizeTexture(shadowCanvas, 1, { srgb: false });
  textures.push(contactShadowMap);

  // 12. Soft Edge-Feather Alpha Mask for Seamless Sanctuary Backdrop Blending
  const [featherCanvas, featherCtx] = makeCanvas(512, 512);
  featherCtx.fillStyle = "#ffffff";
  featherCtx.fillRect(0, 0, 512, 512);
  const leftFade = featherCtx.createLinearGradient(0, 0, 46, 0);
  leftFade.addColorStop(0, "rgba(0,0,0,1)");
  leftFade.addColorStop(1, "rgba(0,0,0,0)");
  featherCtx.globalCompositeOperation = "destination-out";
  featherCtx.fillStyle = leftFade;
  featherCtx.fillRect(0, 0, 46, 512);
  const rightFade = featherCtx.createLinearGradient(512, 0, 466, 0);
  rightFade.addColorStop(0, "rgba(0,0,0,1)");
  rightFade.addColorStop(1, "rgba(0,0,0,0)");
  featherCtx.fillStyle = rightFade;
  featherCtx.fillRect(466, 0, 46, 512);
  const topFade = featherCtx.createLinearGradient(0, 0, 0, 32);
  topFade.addColorStop(0, "rgba(0,0,0,1)");
  topFade.addColorStop(1, "rgba(0,0,0,0)");
  featherCtx.fillStyle = topFade;
  featherCtx.fillRect(0, 0, 512, 32);
  featherCtx.globalCompositeOperation = "source-over";
  const sanctuaryFeatherAlpha = finalizeTexture(featherCanvas, 1, {
    srgb: false,
  });
  textures.push(sanctuaryFeatherAlpha);

  // 13. Layered Atmospheric Mountain Ridge Silhouette Texture (替代生硬锥形山体)
  const [mtnCanvas, mtnCtx] = makeCanvas(1024, 384);
  mtnCtx.clearRect(0, 0, 1024, 384);
  const mtnGrad = mtnCtx.createLinearGradient(0, 60, 0, 384);
  if (tradition === "buddhist") {
    mtnGrad.addColorStop(0, "#667885");
    mtnGrad.addColorStop(0.55, "#7e8a8d");
    mtnGrad.addColorStop(1, "#c8baa6");
  } else {
    mtnGrad.addColorStop(0, "#415e5f");
    mtnGrad.addColorStop(0.55, "#64827d");
    mtnGrad.addColorStop(1, "#b4c7bf");
  }
  mtnCtx.fillStyle = mtnGrad;
  mtnCtx.beginPath();
  mtnCtx.moveTo(0, 384);
  for (let x = 0; x <= 1024; x += 16) {
    const t = x / 1024;
    const h =
      210 -
      Math.sin(t * Math.PI * 3.1 + 0.4) * 58 -
      Math.sin(t * Math.PI * 7.4 + 1.1) * 28 -
      Math.cos(t * Math.PI * 14.0) * 12;
    mtnCtx.lineTo(x, h);
  }
  mtnCtx.lineTo(1024, 384);
  mtnCtx.closePath();
  mtnCtx.fill();
  const mountainRidgeMap = finalizeTexture(mtnCanvas, 1, { srgb: true });
  textures.push(mountainRidgeMap);

  return {
    textures,
    courtyardStoneMap,
    courtyardStoneBump,
    hallFloorMap,
    hallFloorBump,
    graniteStepMap,
    graniteStepBump,
    pillarWoodMap,
    doorPanelMap,
    roofTileMap,
    roofTileBump,
    skyGradMap,
    waterRippleMap,
    foliageBoughMap,
    bambooLeafMap,
    contactShadowMap,
    sanctuaryFeatherAlpha,
    mountainRidgeMap,
    dispose: () => {
      textures.forEach((t) => t.dispose());
    },
  };
}

/**
 * 安全加载 Vite 本地场景实景图片为 Three.js sRGB 贴图
 */
export function loadSceneTexture(
  url: string,
  maxAnisotropy: number,
  onReady?: (tex: THREE.Texture) => void,
): THREE.Texture {
  const loader = new THREE.TextureLoader();
  const tex = loader.load(
    url,
    (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      loaded.anisotropy = Math.max(1, Math.min(16, maxAnisotropy));
      loaded.minFilter = THREE.LinearMipmapLinearFilter;
      loaded.magFilter = THREE.LinearFilter;
      loaded.needsUpdate = true;
      onReady?.(loaded);
    },
    undefined,
    () => {
      // Silent safe fallback if an asset fails to decode
    },
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
