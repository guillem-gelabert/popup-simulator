import type { RapierRigidBody, RigidBodyTypeString } from "@react-three/rapier";
import type { RefObject } from "react";
import type { Object3D, Vector3 } from "three";

export interface HingeProps {
  position: Object3D["position"];
  quaternion: Object3D["quaternion"];
  rotationAxis: Vector3;
  constraintObjects: [RefObject<RapierRigidBody>, RefObject<RapierRigidBody>];
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
