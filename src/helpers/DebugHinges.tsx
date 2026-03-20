import { Html } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";
import type { HingeProps } from "../types";
import { type Group } from "three";

interface DebugHingesProps {
  transforms: Record<string, HingeProps>;
}

export function DebugHinges({ transforms }: DebugHingesProps) {
  if (!transforms) return null;

  return (
    <>
      {Object.entries(transforms).map(([name, data]) => (
        <HingeHelper key={name} name={name} data={data} />
      ))}
    </>
  );
}

interface HingeHelperProps {
  name: string;
  data: HingeProps;
}

function HingeHelper({ name, data }: HingeHelperProps) {
  const ref = useRef<Group>(null);

  return (
    <group ref={ref} position={data.position}>
      {/* Visualize hinge position */}
      <mesh>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="red" />
      </mesh>

      {/* Visualize hinge axis */}
      <arrowHelper
        args={[
          new THREE.Vector3(...data.rotationAxis),
          new THREE.Vector3(0, 0, 0),
          0.3,
          0x00ff00,
        ]}
      />

      {/* Label */}
      <Html position={[0, 0.1, 0]}>
        <div style={{ fontSize: "10px", color: "white" }}>{name}</div>
      </Html>
    </group>
  );
}
