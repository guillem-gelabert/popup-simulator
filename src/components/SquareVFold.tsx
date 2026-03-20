import useLoadEmptiesToJointProps from "../hooks/useLoadEmptiesToJointProps";
import { useEffect, useState } from "react";

import type { Object3D, Object3DEventMap } from "three";
import type { HingeProps } from "../types";
import { HingedPlanes } from "./HingedPlanes";

export default function SquareVFold() {
  const { hingeTransforms, planes } = useLoadEmptiesToJointProps(
    "../../models/simple_fold.glb",
  );

  interface State {
    mainHinge: HingeProps | null;
    planeObjects: [
      Object3D<Object3DEventMap> | null,
      Object3D<Object3DEventMap> | null,
    ];
  }

  const [state, setState] = useState<State>({
    mainHinge: null,
    planeObjects: [null, null],
  });

  useEffect(() => {
    const mainHinge = hingeTransforms[0];
    if (!mainHinge) return;
    setState({
      mainHinge,
      planeObjects: mainHinge.constraintObjects,
    });
  }, [hingeTransforms, planes]);

  if (
    !state.planeObjects[0]?.name ||
    !state.planeObjects[1]?.name ||
    !state.mainHinge?.name
  ) {
    return null;
  }

  return <HingedPlanes hinge={state.mainHinge} planeObjects={planes} />;
}
