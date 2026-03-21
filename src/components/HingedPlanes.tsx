import { useFrame } from "@react-three/fiber";
import {
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import { useControls } from "leva";
import { useRef } from "react";
import type { LoadedHingeProps, PlaneProps } from "../types";
import { DebugHinges } from "../helpers/DebugHinges";

export function HingedPlanes({
  hinge,
  planeObjects,
}: {
  hinge: LoadedHingeProps;
  planeObjects: PlaneProps[];
}) {
  const { angle, stiffness, damping } = useControls("Fold Motor", {
    angle: { value: 0, max: 0, min: -Math.PI, step: -0.05 },
    stiffness: { value: 3000, min: 0, max: 5000, step: 100 },
    damping: { value: 1500, min: 0, max: 2000, step: 100 },
  });

  const left = useRef<RapierRigidBody>(null!);
  const right = useRef<RapierRigidBody>(null!);

  const joint = useRevoluteJoint(left, right, [
    hinge.position.toArray(),
    hinge.position.toArray(),
    hinge.rotationAxis.toArray(),
    [-Math.PI + 0.1, 0.5],
  ]);

  useFrame(() => {
    if (joint.current) {
      joint.current.configureMotorPosition(angle, stiffness, damping);
    }
  });

  return (
    <group>
      <RigidBody
        ref={left}
        type={planeObjects[0].rigidBodyType}
        colliders="cuboid"
      >
        <primitive
          castShadow
          receiveShadow
          object={planeObjects[0].node}
        />
      </RigidBody>
      <RigidBody
        ref={right}
        type={planeObjects[1].rigidBodyType}
        colliders="cuboid"
      >
        <primitive
          castShadow
          receiveShadow
          object={planeObjects[1].node}
        />
      </RigidBody>
      <DebugHinges transforms={{ [hinge.name]: hinge }} />
    </group>
  );
}
