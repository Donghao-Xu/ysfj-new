import { SplatMesh } from "@sparkjsdev/spark";
import * as THREE from "three";
import type { SpatialSceneSpec } from "@/spatial/spatialSceneConfig";

export type WebGLCapabilityReport = {
  webgl2Supported: boolean;
  webgpuSupported: boolean;
  isSoftwareGl: boolean;
  rendererLabel: string;
};

export type LoadedSplatSceneResult = {
  mesh: SplatMesh;
  splatCount: number;
  boundingBox: THREE.Box3;
  loadTimeMs: number;
};

export function probeSpatialWebCapabilities(): WebGLCapabilityReport {
  if (typeof document === "undefined") {
    return {
      webgl2Supported: false,
      webgpuSupported: false,
      isSoftwareGl: true,
      rendererLabel: "Server / SSR",
    };
  }

  const webgpuSupported =
    typeof navigator !== "undefined" && "gpu" in navigator;

  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2") as WebGL2RenderingContext | null;
    if (!gl) {
      return {
        webgl2Supported: false,
        webgpuSupported,
        isSoftwareGl: true,
        rendererLabel: "WebGL2 不可用",
      };
    }

    const debugExt = gl.getExtension("WEBGL_debug_renderer_info");
    const rawRenderer = debugExt
      ? String(gl.getParameter(debugExt.UNMASKED_RENDERER_WEBGL) || "")
      : String(gl.getParameter(gl.RENDERER) || "");
    const isSoftwareGl =
      /SwiftShader|llvmpipe|softpipe|Software|Basic Render|WARP/i.test(
        rawRenderer,
      );
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    return {
      webgl2Supported: true,
      webgpuSupported,
      isSoftwareGl,
      rendererLabel: rawRenderer || "WebGL2 GPU",
    };
  } catch {
    return {
      webgl2Supported: false,
      webgpuSupported,
      isSoftwareGl: true,
      rendererLabel: "WebGL2 初始化异常",
    };
  }
}

/**
 * 统一 3DGS 资源加载器（基于 @sparkjsdev/spark SplatMesh）：
 * - 支持真实 .spz / .ply / .splat / .ksplat / .sog 远程 URL 或本地二进制文件
 * - 明确追踪加载进度，加载失败时真实报错，绝不以静态图片伪装成功
 */
export async function loadSpatialSplatAsset({
  sceneSpec,
  customFileBytes,
  customFileName,
  onProgress,
  signal,
}: {
  sceneSpec: SpatialSceneSpec;
  customFileBytes?: Uint8Array | null;
  customFileName?: string;
  onProgress?: (pct: number | null, label: string) => void;
  signal?: AbortSignal;
}): Promise<LoadedSplatSceneResult> {
  const startedAt = performance.now();
  onProgress?.(0, `正在下载并解析 3DGS 场景（${sceneSpec.asset.approxSizeLabel}）…`);

  const mesh = new SplatMesh({
    ...(customFileBytes
      ? {
          fileBytes: customFileBytes.slice(),
          fileName: customFileName || "custom.spz",
        }
      : {
          url: sceneSpec.asset.url,
        }),
    onProgress: (ev) => {
      if (signal?.aborted) return;
      if (ev.lengthComputable && ev.total > 0) {
        const pct = Math.min(99, Math.round((ev.loaded / ev.total) * 100));
        onProgress?.(pct, `正在下载 3DGS 数据 (${pct}%)…`);
      } else {
        onProgress?.(null, "正在读取与解压高斯点云数据…");
      }
    },
  });

  mesh.quaternion.set(
    sceneSpec.transform.quaternion[0],
    sceneSpec.transform.quaternion[1],
    sceneSpec.transform.quaternion[2],
    sceneSpec.transform.quaternion[3],
  );
  mesh.position.set(
    sceneSpec.transform.position[0],
    sceneSpec.transform.position[1],
    sceneSpec.transform.position[2],
  );
  mesh.scale.setScalar(sceneSpec.transform.scale);

  try {
    await mesh.initialized;
  } catch (err) {
    mesh.dispose();
    throw err instanceof Error
      ? err
      : new Error("3DGS 场景解析失败，请确认文件格式或网络连接。");
  }

  if (signal?.aborted) {
    mesh.dispose();
    throw new Error("已取消当前场景加载");
  }

  let splatCount = 0;
  try {
    splatCount = mesh.packedSplats?.numSplats ?? mesh.splats?.getNumSplats() ?? 0;
  } catch {
    splatCount = 0;
  }

  let boundingBox = new THREE.Box3();
  try {
    boundingBox = mesh.getBoundingBox(true);
  } catch {
    boundingBox = new THREE.Box3();
  }

  return {
    mesh,
    splatCount,
    boundingBox,
    loadTimeMs: Math.round(performance.now() - startedAt),
  };
}
