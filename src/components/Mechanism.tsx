import { useRef } from "react";
import {
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import useCustomBlenderLoader from "../hooks/useCustomBlenderLoader";
import { DebugHinges } from "../helpers/DebugHinges";
import { useFrame } from "@react-three/fiber";
import type { HingeProps } from "../types";

export default function SquareVFold() {
  const { planes, hingeTransforms } = useCustomBlenderLoader(
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

    return () => {
      map.delete(plane);
    };
  };

  if (!hingeTransforms.length) {
    return null;
  }

  return (
    <>
      <group>
        {planes.map((plane) => (
          <RigidBody
            type={"fixed"}
            colliders="cuboid"
            ref={getRefCallback(plane.name)}
            key={plane.name}
          >
            <primitive object={plane.node} />
          </RigidBody>
        ))}
      </group>
      <group>
        {hingeTransforms.map((hinge) => (
          <group key={hinge.name}>
            <RevoluteHinge hinge={hinge} />
            <DebugHinges transforms={{ [hinge.name]: hinge }} />
          </group>
        ))}
      </group>
    </>
  );
}

interface RevoluteJointProps {
  hinge: HingeProps;
}

const RevoluteHinge = (props: RevoluteJointProps) => {
  const joint = useRevoluteJoint(
    props.hinge.constraintObjects[0],
    props.hinge.constraintObjects[1],
    [
      props.hinge.position.toArray(),
      props.hinge.position.toArray(),
      props.hinge.rotationAxis.toArray(),
      [0, Math.PI],
    ],
  );

  useFrame(() => {
    if (joint.current) {
      joint.current.configureMotorPosition(0, 100, 10);
    }
  });

  console.log(props);
  return null;
};
