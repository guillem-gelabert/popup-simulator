import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";

import type { PlaneProps } from "../types";
import z from "zod";
import type { RigidBodyTypeString } from "@react-three/rapier";

export default function useLoadEmptiesToJoints(path: string) {
  // Question: why are we getting the scene instead of the nodes?
  // Aren't the transformations in the nodes?
  const { scene, nodes } = useGLTF(path);

  const [planes, setPlanes] = useState<Array<PlaneProps>>([]);

  const blenderPlaneUserDataSchema = z.object({
    rb_type: z.enum(["PASSIVE", "ACTIVE"]),
    rb_animated: z.boolean(),
    rb_dynamic: z.boolean().optional(),
  });

  const blenderMesh3DSchema = z.object({
    type: z.literal("Mesh"),
    userData: blenderPlaneUserDataSchema,
  });

  const unknownTypeSchema = z.object({
    type: z.string().refine((t) => t !== "Mesh"),
  });

  const blenderObjectSchema = z.union([
    z.discriminatedUnion("type", [blenderMesh3DSchema]),
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
    });
  }, []);

  return { planes };
}
