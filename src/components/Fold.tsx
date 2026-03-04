import { useFrame } from "@react-three/fiber";
import {
  RapierRigidBody,
  useRevoluteJoint,
  useSpringJoint,
  RigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { useRef } from "react";
import { DoubleSide, Vector3 } from "three";
import SquareVFold from "./SquareVFold";

export default function Fold() {
  const half = 1.25; // half-width of each page panel (2.5 / 2)
  const y = 1;
  const z = 0;
  const t = 0.005; // page half-thickness (0.01 / 2)
  const pt = 0.0025; // popup half-thickness (0.005 / 2)

  const max = Math.PI - 0.02;

  const blue = useRef<RapierRigidBody>(null!);
  const red = useRef<RapierRigidBody>(null!);
  const white = useRef<RapierRigidBody>(null!);
  const green = useRef<RapierRigidBody>(null!);
  const joint = useRevoluteJoint(white, green, [
    [half, t, 0],
    [-half, t, 0],
    [0, 0, 1],
    [0, max],
  ]);

  useRevoluteJoint(white, blue, [
    [0.75, t, 0], // white surface → world (-0.5, 0.005, 0)
    [0, -pt, -1], // blue bottom edge → world (-0.5, 0.005, 0)
    [1, 0, 0], // axis along glueline (short edge)
    [0, max],
  ]);

  useRevoluteJoint(red, green, [
    [0, -pt, -1], // red bottom edge → world (0.5, 0.005, 0)
    [-0.75, t, 0], // green surface → world (0.5, 0.005, 0)
    [1, 0, 0], // axis along glueline (short edge)
    [0, max],
  ]);

  useSpringJoint(red, blue, [
    [-0.5, 0, 1], // red top-left corner
    [0.5, 0, 1], // blue top-right corner
    0, // rest length (keep them together)
    500, // stiffness
    50, // damping
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

  return (
    <group>
      <SquareVFold red={red} blue={blue} />
      <RigidBody ref={white} position={[-half, 0, 0]} type="dynamic">
        <mesh receiveShadow>
          <boxGeometry args={[2.5, 0.01, 5]} />
          <meshStandardMaterial color="bone" side={DoubleSide} />
        </mesh>
      </RigidBody>
      <RigidBody
        ref={green}
        position={[half, 0, 0]}
        type="dynamic"
        density={100}
        gravityScale={10}
      >
        <mesh receiveShadow>
          <boxGeometry args={[2.5, 0.01, 5]} />
          <meshStandardMaterial color="darkgreen" side={DoubleSide} />
        </mesh>
      </RigidBody>
    </group>
  );
}
