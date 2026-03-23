import { createRef, useRef, useState, type RefObject } from "react";
import {
  RapierRigidBody,
  RigidBody,
  useRevoluteJoint,
} from "@react-three/rapier";
import useCustomBlenderLoader from "../hooks/useCustomBlenderLoader";
import { useFrame } from "@react-three/fiber";
import type { HingeProps } from "../types";
import { useControls } from "leva";
import { DebugHinges } from "../helpers/DebugHinges";
import { Html } from "@react-three/drei";
import { Box3, Vector3 } from "three";

export default function SquareVFold() {
  const { planes, hingeTransforms } = useCustomBlenderLoader(
    "../../models/vfold_mechanism.glb",
  );

  /*
   * Approach seen here:
   * https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
   */
  const planeRefs =
    useRef<Map<string, RefObject<RapierRigidBody | null>>>(null);
  const [, forceUpdate] = useState(false);

  const getMap = () => {
    if (!planeRefs.current) {
      // Initialize the Map on first usage.
      planeRefs.current = new Map();
    }
    return planeRefs.current;
  };

  const getRefCallback = (planeName: string) => (body: RapierRigidBody) => {
    const map = getMap();
    let ref = map.get(planeName);

    if (!ref) {
      ref = createRef<RapierRigidBody | null>();
      map.set(planeName, ref);
    }

    ref.current = body;
    if (planes.length === planeRefs.current?.size) {
      forceUpdate(true);
    }

    return () => {
      ref.current = null;
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
            key={plane.name}
          >
            <primitive castShadow receiveShadow object={plane.node} />
            <Html
              position={(() => {
                const box = new Box3().setFromObject(plane.node);
                const center = new Vector3();
                box.getCenter(center);
                center.y += 0.1;
                return center.toArray();
              })()}
            >
              <div style={{ fontSize: "10px", color: "white" }}>
                {plane.name}, {plane.rigidBodyType}
              </div>
            </Html>
          </RigidBody>
        ))}
      </group>
      <group>
        {hingeTransforms.map((hinge) => {
          const object1 = planeRefs.current?.get(
            hinge.constraintObjects[0].name,
          );
          const object2 = planeRefs.current?.get(
            hinge.constraintObjects[1].name,
          );
          if (
            !object1 ||
            !object2 ||
            !isPopulatedRef(object1) ||
            !isPopulatedRef(object2)
          ) {
            return null;
          }
          return (
            <group key={hinge.name}>
              <RevoluteHinge
                position={hinge.position}
                quaternion={hinge.quaternion}
                rotationAxis={hinge.rotationAxis}
                constraintObjects={[object1, object2]}
                name={hinge.name}
                node={hinge.node}
              />
              <DebugHinges transforms={{ [hinge.name]: hinge }} />
            </group>
          );
        })}
      </group>
    </>
  );
}

function isPopulatedRef(
  ref: RefObject<RapierRigidBody | null>,
): ref is RefObject<RapierRigidBody> {
  return ref.current !== null;
}

const RevoluteHinge = (props: HingeProps) => {
  const joint = useRevoluteJoint(
    props.constraintObjects[0],
    props.constraintObjects[1],
    [
      props.position.toArray(),
      props.position.toArray(),
      props.rotationAxis.toArray(),
      [0, Math.PI],
    ],
  );

  const { angle, stiffness, damping } = useControls("Fold Motor", {
    angle: { value: 0, min: 0, max: Math.PI, step: 0.05 },
    stiffness: { value: 3000, min: 0, max: 5000, step: 100 },
    damping: { value: 1500, min: 0, max: 2000, step: 100 },
  });

  useFrame(() => {
    if (joint.current && props.name === "LeftPlane_RightPlane_Hinge") {
      joint.current.configureMotorPosition(angle, stiffness, damping);
    }
  });

  return null;
};
