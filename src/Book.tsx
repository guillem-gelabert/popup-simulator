import { useLayoutEffect, useRef } from "react";
import { Physics } from "@react-three/rapier";
import type { DirectionalLight } from "three";

import ViewportGizmoHelper from "./helpers/ViewportGizmo";
import Mechanism from "./components/Mechanism";

export default function Book() {
  const dirLight = useRef<DirectionalLight>(null);

  useLayoutEffect(() => {
    const sh = dirLight.current?.shadow;
    if (!sh) return;
    sh.mapSize.set(2048, 2048);
    // Peter panning ↑ when normalBias/bias are large. Acne/stripes ↑ when both are 0.
    // If edges still float: keep bias at 0 and lower normalBias in 0.001 steps toward 0.
    sh.normalBias = 0.001;
    sh.bias = 0;
  }, []);

  return (
    <>
      <ViewportGizmoHelper placement="top-right" />
      <directionalLight
        ref={dirLight}
        castShadow
        position={[1, 2, 3]}
        intensity={4.5}
      />
      <ambientLight intensity={1.5} />
      <Physics debug={true}>
        <Mechanism />
      </Physics>
    </>
  );
}
