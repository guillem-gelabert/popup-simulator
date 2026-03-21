import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import { Quaternion, Vector3 } from "three";

import type { LoadedHingeProps, PlaneProps } from "../types";
import z from "zod";
import type { RigidBodyTypeString } from "@react-three/rapier";

export default function useLoadEmptiesToJoints(path: string) {
  // Question: why are we getting the scene instead of the nodes?
  // Aren't the transformations in the nodes?
  const { scene, nodes } = useGLTF(path);
  const [hingeTransforms, setHingeTransforms] = useState<Array<LoadedHingeProps>>([]);

  const [planes, setPlanes] = useState<Array<PlaneProps>>([]);

  const blenderPlaneUserDataSchema = z.object({
    rb_type: z.enum(["PASSIVE", "ACTIVE"]),
    rb_animated: z.boolean(),
    rb_dynamic: z.boolean().optional(),
  });

  const blenderEmptyUserDataSchema = z.object({
    rbc_type: z.enum(["HINGE", "FIXED"]),
    rbc_object1: z.string(),
    rbc_object2: z.string(),
  });

  const blenderObject3DSchema = z.object({
    type: z.literal("Object3D"),
    userData: blenderEmptyUserDataSchema,
  });

  const blenderMesh3DSchema = z.object({
    type: z.literal("Mesh"),
    userData: blenderPlaneUserDataSchema,
  });

  const unknownTypeSchema = z.object({
    type: z.string().refine((t) => t !== "Mesh" && t !== "Object3D"),
  });

  const blenderObjectSchema = z.union([
    z.discriminatedUnion("type", [blenderObject3DSchema, blenderMesh3DSchema]),
    unknownTypeSchema.transform(() => null),
  ]);

  useEffect(() => {
    scene.traverse((object) => {
      const { data: object3dWithUserData, error } =
        blenderObjectSchema.safeParse(object);

      if (error) {
        console.error(error);
      }

      if (!object3dWithUserData) return;
      if (object3dWithUserData?.type === "Mesh") {
        const blenderUserData = object3dWithUserData.userData;
        let rigidBodyType: RigidBodyTypeString = "fixed";
        if (blenderUserData.rb_type === "ACTIVE") {
          if (blenderUserData.rb_dynamic) {
            rigidBodyType = "dynamic";
          } else {
            rigidBodyType = "kinematicPosition";
          }
        } else if (blenderUserData.rb_type === "PASSIVE") {
          if (blenderUserData.rb_animated) {
            rigidBodyType = "dynamic";
          }
        }

        setPlanes((prev) => [
          ...prev,
          {
            node: nodes[object.name],
            position: object.position,
            quaternion: object.quaternion,
            rigidBodyType,
            name: object.name,
          } as PlaneProps,
        ]);

        return;
      }

      if (object3dWithUserData.type === "Object3D") {
        const blenderUserData = object3dWithUserData.userData;

        if (blenderUserData.rbc_type === "HINGE") {
          /* In Blender we aligned the Empty's Z-Axis to the fold.
           * We need to extract it.
           * When exporting from Blender we rotate the scene so that its up direction
           * points along the Y-Axis. Blender rotates the scene by -90 degrees around the X-Axis.  We do this because in Three.js Y is the vertical axis.
           * The rotation axis is a point that represents the direction from the origin.
           */
          const rotationAxis = new Vector3(0, 1, 0).applyQuaternion(
            object.getWorldQuaternion(new Quaternion()),
          );

          setHingeTransforms((prev) => [
            ...prev,
            {
              node: nodes[object.name],
              quaternion: object.getWorldQuaternion(new Quaternion()),
              position: object.getWorldPosition(new Vector3()),
              rotationAxis,
              constraintObjects: [
                nodes[object.userData["rbc_object1"]],
                nodes[object.userData["rbc_object2"]],
              ],
              name: object.name,
            },
          ]);
        }
      }
    });
  }, []);

  return { scene, hingeTransforms, planes };
}
