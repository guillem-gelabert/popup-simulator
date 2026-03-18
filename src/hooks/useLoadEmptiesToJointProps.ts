import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Vector3 } from "three";
import type { HingeProps } from "../types";

export default function useLoadEmptiesToJoints(path: string) {
  const { scene } = useGLTF(path);
  const [hingeTransforms, setHingeTransforms] = useState<
    Record<string, HingeProps>
  >({});

  useEffect(() => {
    scene.traverse((object) => {
      if (object.type !== "Object3D") {
        return;
      }

      const HINGE_SUFFIX = "_Hinge";

      if (object.name.endsWith(HINGE_SUFFIX)) {
        if (hingeTransforms[object.name]) {
          return;
        }

        const rotationAxis = new Vector3(0, 0, 1).applyQuaternion(
          object.quaternion,
        );

        console.log(rotationAxis);

        setHingeTransforms((prev) => ({
          ...prev,
          [object.name]: {
            quaternion: object.quaternion,
            position: object.getWorldPosition(object.position),
            rotationAxis,
          },
        }));
      }
    });
  }, []);

  return { scene, hingeTransforms };
}
