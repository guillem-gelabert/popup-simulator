import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { ViewportGizmo, type GizmoOptions } from "three-viewport-gizmo";

export default function ViewportGizmoHelper(props: GizmoOptions) {
  const { camera, gl, controls } = useThree();
  const gizmo = useRef<ViewportGizmo>(null!);

  useEffect(() => {
    gizmo.current = new ViewportGizmo(camera, gl, { ...props });
    if (controls) gizmo.current.attachControls(controls as never);
    return () => gizmo.current.dispose();
  }, [camera, gl, controls, props]);

  useFrame((state) => {
    state.gl.render(state.scene, state.camera);
    gizmo.current?.update().render();
  }, 1);

  return null;
}
