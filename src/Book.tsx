import { Physics, RigidBody } from "@react-three/rapier";

import Fold from "./components/Fold";
import ViewportGizmoHelper from "./helpers/ViewportGizmoHelper";

export default function Book() {
  return (
    <>
      <ViewportGizmoHelper placement="top-right" />
      <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />
      <Physics debug={true}>
        <Fold />
        <RigidBody type="fixed">
          <mesh receiveShadow position-y={-1.25}>
            <boxGeometry args={[10, 0.5, 10]} />
            <meshStandardMaterial color="greenyellow" />
          </mesh>
        </RigidBody>
      </Physics>
    </>
  );
}
