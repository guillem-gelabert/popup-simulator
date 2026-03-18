import { RigidBody } from "@react-three/rapier";

export default function Tabletop() {
  const height = 0.5;
  const width = 10;
  const length = 10;

  return (
    <group>
      <RigidBody type="fixed">
        <mesh receiveShadow position-y={-height / 2}>
          <boxGeometry args={[width, height, length]} />
          <meshStandardMaterial color="greenyellow" />
        </mesh>
      </RigidBody>
    </group>
  );
}
