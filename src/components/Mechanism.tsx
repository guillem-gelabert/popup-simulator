import { useRef } from "react";
import useCustomBlenderMeshLoader from "../hooks/useCustomBlenderMeshLoader";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";

export default function SquareVFold() {
  const { planes } = useCustomBlenderMeshLoader(
    "../../models/vfold_mechanism.glb",
  );

  /*
   * Approach seen here:
   * https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
   */
  const planeRefs = useRef<Map<string, RapierRigidBody>>(null);

  const getMap = () => {
    if (!planeRefs.current) {
      // Initialize the Map on first usage.
      planeRefs.current = new Map();
    }
    return planeRefs.current;
  };

  //   const printName = (plane) => {
  //     const map = getMap();
  //     const node = map.get(plane);
  //     console.log(node);
  //   };

  const getRefCallback = (plane: string) => (body: RapierRigidBody) => {
    const map = getMap();
    map.set(plane, body);

    console.log(body);

    return () => {
      map.delete(plane);
    };
  };

  return (
    <>
      <group>
        {planes.map((plane) => (
          <RigidBody
            type={plane.rigidBodyType}
            colliders="cuboid"
            ref={getRefCallback(plane.name)}
          >
            <primitive key={plane.name} object={plane.node} />
          </RigidBody>
        ))}
      </group>
    </>
  );
}
