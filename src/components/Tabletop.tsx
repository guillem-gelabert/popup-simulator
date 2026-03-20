import { RigidBody } from "@react-three/rapier";

export default function Tabletop() {
  const height = 0.5;
  const width = 10;
  const length = 10;

  return (
    <group>
      <RigidBody type="fixed" position-y={-height / 2 - 0.01}>
        <mesh receiveShadow>
          <boxGeometry args={[width, height, length]} />
          <meshStandardMaterial color="greenyellow" />
        </mesh>
      </RigidBody>
    </group>
  );
}
