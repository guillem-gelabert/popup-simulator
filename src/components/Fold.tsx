import { useFrame } from "@react-three/fiber";
import {
  RapierRigidBody,
  useRevoluteJoint,
  RigidBody,
} from "@react-three/rapier";
import { useControls } from "leva";
import { useRef } from "react";
import { DoubleSide } from "three";

export default function Fold() {
  const half = 1.25; // half-width of each panel (2.5 / 2)
  const y = 1;
  const z = 0;
  const t = 0.005;

  const max = Math.PI - 0.02;

  const white = useRef<RapierRigidBody>(null!);
  const green = useRef<RapierRigidBody>(null!);
  const joint = useRevoluteJoint(white, green, [
    [half, t, 0],
    [-half, t, 0],
    [0, 0, 1],
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

  return (
    <group>
      <RigidBody ref={white} position={[-half, y, z]} gravityScale={0}>
        <mesh receiveShadow>
          <boxGeometry args={[2.5, 0.01, 5]} />
          <meshStandardMaterial color="bone" side={DoubleSide} />
        </mesh>
      </RigidBody>
      <RigidBody ref={green} position={[+half, y, z]} type="fixed">
        <mesh receiveShadow>
          <boxGeometry args={[2.5, 0.01, 5]} />
          <meshStandardMaterial color="darkgreen" side={DoubleSide} />
        </mesh>
      </RigidBody>
    </group>
  );
}
