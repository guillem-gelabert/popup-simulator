import type { Object3D, Vector3 } from "three";

export interface HingeProps {
  position: Object3D["position"];
  quaternion: Object3D["quaternion"];
  rotationAxis: Vector3;
}
