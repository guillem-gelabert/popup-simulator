import {
  CuboidCollider,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";

import { DoubleSide } from "three";

export default function SquareVFold({
  blue,
  red,
}: {
  blue: React.RefObject<RapierRigidBody>;
  red: React.RefObject<RapierRigidBody>;
}) {
  const width = 1;

  const height = 2;
  const thickness = 0.005;

  return (
    <group>
      <RigidBody
        ref={blue}
        type="dynamic"
        position={[-0.5, 0.0075, 1]}
        gravityScale={-10}
      >
        <mesh receiveShadow>
          <boxGeometry args={[width, thickness, height]} />
          <meshStandardMaterial color="blue" side={DoubleSide} />
        </mesh>
      </RigidBody>
      <RigidBody
        ref={red}
        type="dynamic"
        position={[0.5, 0.0075, 1]}
        gravityScale={-10}
      >
        <mesh receiveShadow>
          <boxGeometry args={[width, thickness, height]} />
          <meshStandardMaterial color="red" side={DoubleSide} />
        </mesh>
      </RigidBody>
    </group>
  );
}
