import * as THREE from "three";
import type { SpatialInteractiveAnchor } from "@/spatial/spatialSceneConfig";

export type SpatialInteractionLayerHandle = {
  group: THREE.Group;
  setVisible: (visible: boolean) => void;
  highlightAnchor: (anchorId: string | null) => void;
  raycastAnchorAtNdc: (
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera,
  ) => SpatialInteractiveAnchor | null;
  dispose: () => void;
};

/**
 * 未来互动对象层（SpatialInteractionLayer）：
 * - 独立管理未来佛教/道教互动对象（佛像、供桌、香炉、供灯、花瓶、祈愿区）的空间坐标与状态。
 * - 与 3DGS 视觉场景彻底解耦，确保互动对象不会烘焙死在扫描模型内，可独立点击与状态更新。
 */
export function createSpatialInteractionLayer(
  anchors: SpatialInteractiveAnchor[],
): SpatialInteractionLayerHandle {
  const group = new THREE.Group();
  group.name = "spatial-future-interaction-layer";

  const hitMeshes: THREE.Mesh[] = [];
  const ringById = new Map<string, THREE.Mesh>();
  const anchorByMeshUuid = new Map<string, SpatialInteractiveAnchor>();
  const disposables: { dispose: () => void }[] = [];

  const raycaster = new THREE.Raycaster();
  const ndcVec = new THREE.Vector2();

  for (const anchor of anchors) {
    const holder = new THREE.Group();
    holder.position.set(
      anchor.position[0],
      anchor.position[1],
      anchor.position[2],
    );

    const color = new THREE.Color(anchor.colorHex);

    // Subtle spatial footprint ring
    const ringGeo = new THREE.RingGeometry(
      Math.max(0.05, anchor.radius * 0.72),
      anchor.radius,
      32,
    );
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    holder.add(ringMesh);
    ringById.set(anchor.id, ringMesh);

    // Subtle vertical locator stem
    const stemGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0.28, 0),
    ]);
    const stemMat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.7,
    });
    const stemLine = new THREE.Line(stemGeo, stemMat);
    holder.add(stemLine);

    // Compact diamond beacon at tip for raycasting
    const markerGeo = new THREE.OctahedronGeometry(0.055, 0);
    const markerMat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    markerMesh.position.set(0, 0.31, 0);
    holder.add(markerMesh);

    hitMeshes.push(markerMesh, ringMesh);
    anchorByMeshUuid.set(markerMesh.uuid, anchor);
    anchorByMeshUuid.set(ringMesh.uuid, anchor);

    disposables.push(ringGeo, ringMat, stemGeo, stemMat, markerGeo, markerMat);
    group.add(holder);
  }

  const highlightAnchor = (anchorId: string | null) => {
    ringById.forEach((mesh, id) => {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = id === anchorId ? 0.95 : 0.55;
      mesh.scale.setScalar(id === anchorId ? 1.15 : 1.0);
    });
  };

  const raycastAnchorAtNdc = (
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera,
  ): SpatialInteractiveAnchor | null => {
    if (!group.visible || hitMeshes.length === 0) return null;
    ndcVec.set(ndcX, ndcY);
    raycaster.setFromCamera(ndcVec, camera);
    const hits = raycaster.intersectObjects(hitMeshes, false);
    if (hits.length === 0) return null;
    return anchorByMeshUuid.get(hits[0].object.uuid) || null;
  };

  return {
    group,
    setVisible: (visible: boolean) => {
      group.visible = visible;
    },
    highlightAnchor,
    raycastAnchorAtNdc,
    dispose: () => {
      for (const d of disposables) {
        d.dispose();
      }
      group.clear();
    },
  };
}
