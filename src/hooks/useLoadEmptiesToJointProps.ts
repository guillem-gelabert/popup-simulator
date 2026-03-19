import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Quaternion, Vector3 } from "three";
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

        /* In Blender we aligned the Empty's Z-Axis to the fold.
         * We need to extract it.
         * When exporting from Blender we rotate the scene so that its up direction
         * points along the Y-Axis. Blender rotates the scene by -90 degrees around the X-Axis.  We do this because in Three.js Y is the vertical axis.
         * The rotation axis is a point that represents the direction from the origin.
         */
        const rotationAxis = new Vector3(0, 1, 0).applyQuaternion(
          object.getWorldQuaternion(new Quaternion()),
        );

        setHingeTransforms((prev) => ({
          ...prev,
          [object.name]: {
            quaternion: object.getWorldQuaternion(new Quaternion()),
            position: object.getWorldPosition(new Vector3()),
            rotationAxis,
          },
        }));
      }
    });
  }, []);

  return { scene, hingeTransforms };
}
