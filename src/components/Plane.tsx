import type { ThreeElements } from "@react-three/fiber";
import { RigidBody, type RigidBodyProps } from "@react-three/rapier";
import { DoubleSide } from "three";

interface PlaneProps {
  width: number;
  height: number;
  thickness: number;
  rigidBodyProps?: RigidBodyProps;
  meshProps?: ThreeElements["mesh"];
}

export default function Plane({
  width,
  height,
  thickness,
  rigidBodyProps,
  meshProps,
}: PlaneProps) {
  return (
    <RigidBody
      onCollisionEnter={(e) =>
        console.log("contact with", e.other.rigidBodyObject?.name)
      }
      onCollisionExit={(e) =>
        console.log("lost contact with", e.other.rigidBodyObject?.name)
      }
      {...rigidBodyProps}
    >
      <mesh receiveShadow position={[-width / 2, thickness, 0]} {...meshProps}>
        <boxGeometry args={[width, thickness, height]} />
        <meshStandardMaterial color="red" side={DoubleSide} />
      </mesh>
    </RigidBody>
  );
}
