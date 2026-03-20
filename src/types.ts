import type { RigidBodyTypeString } from "@react-three/rapier";
import type { Object3D, Vector3 } from "three";

export interface HingeProps {
  position: Object3D["position"];
  quaternion: Object3D["quaternion"];
  rotationAxis: Vector3;
  constraintObjects: [Object3D, Object3D];
  name: string;
  node: Object3D;
}

export interface PlaneProps {
  position: Object3D["position"];
  quaternion: Object3D["quaternion"];
  rigidBodyType: RigidBodyTypeString;
  name: string;
  node: Object3D;
}
