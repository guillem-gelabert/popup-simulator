import { Physics } from "@react-three/rapier";

import ViewportGizmoHelper from "./helpers/ViewportGizmo";
import Mechanism from "./components/Mechanism";

export default function Book() {
  return (
    <>
      <ViewportGizmoHelper placement="top-right" />
      <directionalLight castShadow position={[1, 2, 3]} intensity={4.5} />
      <ambientLight intensity={1.5} />
      <Physics debug={true}>
        <Mechanism />
      </Physics>
    </>
  );
}
