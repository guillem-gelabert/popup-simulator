import { useFrame } from "@react-three/fiber";
import {
  RapierRigidBody,
  useRevoluteJoint,
  RigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { useRef } from "react";
import { DoubleSide, Vector3 } from "three";
import SquareVFold from "./SquareVFold";
import AnchorMarker from "./AnchorMarker";

export default function Fold() {
  const width = 4;
  const height = 4;
  const thickness = 0.01; // page half-thickness (0.01 / 2)

  const max = Math.PI - 0.02;

  const left = useRef<RapierRigidBody>(null!);
  const right = useRef<RapierRigidBody>(null!);
  const joint = useRevoluteJoint(left, right, [
    [width / 2, thickness / 2, 0],
    [-width / 2, thickness / 2, 0],
    [0, 0, 1], // axis goes along the z axis (along the spine)
    [0, max],
  ]);

  const { angle, stiffness, damping } = useControls("Fold Motor", {
    angle: { value: 0, min: 0, max: Math.PI, step: 0.01 },
    stiffness: { value: 500, min: 0, max: 500, step: 1 },
    damping: { value: 100, min: 0, max: 100, step: 1 },
  });

  useFrame(() => {
    if (joint.current) {
      joint.current.configureMotorPosition(angle, stiffness, damping);
    }
  });

  // Anchor of the joints on the Fold sides
  const childJointOrigins: [left: Vector3, right: Vector3] = [
    new Vector3(width / 4, thickness, 0), // Left
    new Vector3(-width / 4, thickness, 0), // Right
  ];

  return (
    <group>
      <SquareVFold
        parentPlanes={[left, right]}
        parentOrigins={childJointOrigins}
      />
      {/* <RigidBody ref={left} position={[-width / 2, 0, 0]} type="dynamic">
        <AnchorMarker position={new Vector3(...childJointOrigins[0])} />
        <mesh receiveShadow>
          <boxGeometry args={[width, thickness, height]} />
          <meshStandardMaterial color="red" side={DoubleSide} />
        </mesh>
      </RigidBody>
      <RigidBody
        ref={right}
        position={[width / 2, 0, 0]}
        type="dynamic"
        density={100}
        gravityScale={10}
      >
        <AnchorMarker position={new Vector3(...childJointOrigins[1])} />
        <mesh receiveShadow>
          <boxGeometry args={[width, thickness, height]} />
          <meshStandardMaterial color="white" side={DoubleSide} />
        </mesh>
      </RigidBody> */}
    </group>
  );
}
