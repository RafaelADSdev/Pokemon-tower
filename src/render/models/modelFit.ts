import { AnimationMixer, Box3, Matrix4, Mesh, SkinnedMesh, Vector3, type AnimationClip, type BufferGeometry, type Material, type Object3D } from "three";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";

export interface ModelPart {
  geometry: BufferGeometry;
  material?: Material | Material[];
}

function fit(bounds: Box3, height: number, footprint: number, baseY: number) {
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const scale = Math.min(height / (size.y || 1), footprint / (Math.max(size.x, size.z) || 1));
  if (bounds.isEmpty() || !Number.isFinite(scale)) throw new Error("Model has no usable geometry bounds.");
  const offset: [number, number, number] = [-center.x * scale, baseY - bounds.min.y * scale, -center.z * scale];
  return { offset, scale };
}

export function prepareTowerModel(scene: Object3D, fixedPose?: AnimationClip) {
  const model = cloneSkeleton(scene);
  if (fixedPose) {
    const mixer = new AnimationMixer(model);
    mixer.clipAction(fixedPose).play();
    mixer.update(0);
  }
  model.traverse((object) => { if (object instanceof Mesh) object.castShadow = true; });
  model.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(model, true);
  return { model, ...fit(bounds, 1.31, 1.35, 0.21) };
}

function bakeMesh(mesh: Mesh) {
  const geometry = mesh.geometry.clone();
  const positions = geometry.getAttribute("position");
  const deforms = mesh instanceof SkinnedMesh || mesh.morphTargetInfluences?.some((weight) => weight !== 0);
  if (deforms) {
    const vertex = new Vector3();
    const rest = new Vector3();
    let changed = false;
    for (let index = 0; index < positions.count; index++) {
      mesh.getVertexPosition(index, vertex);
      rest.fromBufferAttribute(positions, index);
      if (vertex.distanceToSquared(rest) > 1e-12) changed = true;
      positions.setXYZ(index, vertex.x, vertex.y, vertex.z);
    }
    if (changed) {
      geometry.deleteAttribute("tangent");
      geometry.computeVertexNormals();
    }
  }
  geometry.deleteAttribute("skinIndex");
  geometry.deleteAttribute("skinWeight");
  geometry.morphAttributes = {};
  geometry.applyMatrix4(mesh.matrixWorld);
  geometry.computeBoundingBox();
  return geometry;
}

const enemyModels = new WeakMap<Object3D, ModelPart[]>();

export function fitEnemyModel(scene: Object3D): ModelPart[] {
  const cached = enemyModels.get(scene);
  if (cached) return cached;

  const parts: ModelPart[] = [];
  const bounds = new Box3();
  scene.updateMatrixWorld(true);
  scene.traverseVisible((object) => {
    if (!(object instanceof Mesh) || !object.geometry.getAttribute("position")?.count) return;
    const geometry = bakeMesh(object);
    if (geometry.boundingBox) bounds.union(geometry.boundingBox);
    parts.push({ geometry, material: object.material });
  });

  const { offset, scale } = fit(bounds, 0.82, 1.13, -0.33);
  const normalization = new Matrix4().makeScale(scale, scale, scale).setPosition(...offset);
  for (const { geometry } of parts) geometry.applyMatrix4(normalization);

  enemyModels.set(scene, parts);
  return parts;
}
