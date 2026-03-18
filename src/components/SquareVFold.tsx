import { DebugHinges } from "../helpers/DebugHinges";
import useLoadEmptiesToJointProps from "../hooks/useLoadEmptiesToJointProps";

export default function SquareVFold() {
  const { scene, hingeTransforms } = useLoadEmptiesToJointProps(
    "../../models/vfold_mechanism.glb",
  );

  return (
    <group>
      <primitive object={scene} />
      <DebugHinges transforms={hingeTransforms} />
    </group>
  );
}
