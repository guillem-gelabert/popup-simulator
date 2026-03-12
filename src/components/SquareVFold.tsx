import {
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
  useSpringJoint,
} from "@react-three/rapier";
import { useRef } from "react";

import { DoubleSide, Vector3 } from "three";
import AnchorMarker from "./AnchorMarker";

export default function SquareVFold({
  parentPlanes,
  parentOrigins,
}: {
  parentOrigins: [left: Vector3, right: Vector3];
  parentPlanes: [
    left: React.RefObject<RapierRigidBody>,
    right: React.RefObject<RapierRigidBody>,
  ];
}) {
  const width = 2;
  const height = 2;
  const thickness = 0.01; // page half-thickness (0.01 / 2)

  const max = Math.PI - 0.02;

  const left = useRef<RapierRigidBody>(null!);
  const right = useRef<RapierRigidBody>(null!);

  const leftAnchor: [x: number, y: number, z: number] = [
    0,
    -thickness / 2,
    -height / 2,
  ];
  const rightAnchor: [x: number, y: number, z: number] = [
    0,
    -thickness / 2,
    -height / 2,
  ];
  useRevoluteJoint(parentPlanes[0], left, [
    parentOrigins[0],
    leftAnchor,
    [1, 0, 0], // axis goes along the x axis
    [0, max],
  ]);

  useRevoluteJoint(parentPlanes[1], right, [
    parentOrigins[1],
    rightAnchor,
    [1, 0, 0], // axis goes along the x axis
    [0, max],
  ]);

  useSpringJoint(left, right, [
    [width / 2, thickness, height / 2], // red top-left corner
    [-width / 2, thickness, height / 2], // blue top-right corner
    0, // restLength: distance between the two anchors at which the spring exerts zero force
    500, // stiffness
    50, // damping
  ]);

  return (
    <group>
      <RigidBody
        ref={left}
        type="dynamic"
        position={[-width / 2, thickness / 2, 0]}
        gravityScale={0}
      >
        <AnchorMarker color="blue" position={new Vector3(...leftAnchor)} />
        <mesh receiveShadow>
          <boxGeometry args={[width, thickness, height]} />
          <meshStandardMaterial color="orange" side={DoubleSide} />
        </mesh>
      </RigidBody>
      <RigidBody
        ref={right}
        type="dynamic"
        position={[width / 2, thickness / 2, 0]}
        gravityScale={0}
      >
        <AnchorMarker color="green" position={new Vector3(...rightAnchor)} />
        <mesh receiveShadow>
          <boxGeometry args={[width, thickness, height]} />
          <meshStandardMaterial color="green" side={DoubleSide} />
        </mesh>
      </RigidBody>
    </group>
  );
}
