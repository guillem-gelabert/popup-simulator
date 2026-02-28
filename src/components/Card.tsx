import { useMemo } from "react";
import * as THREE from "three";
import { useControls } from "leva";

const DEG2RAD = THREE.MathUtils.degToRad;

export function Card() {
  const { pageAngle, showLeft, showRight } = useControls({
    pageAngle: { value: 0, min: 0, max: 180, step: 0.01 },
    showLeft: true,
    showRight: true,
  });

  const leftPagePivot = useMemo(() => new THREE.Vector3(-0.5, 0.5, 0), []);
  const foldPivot = useMemo(() => new THREE.Vector3(0.25, 0, 0), []);

  const angleRad = DEG2RAD(pageAngle);

  return (
    <>
      {/* Left page — rotated 180° + pageAngle around Y */}
      <mesh
        visible={showLeft}
        position={[0.5, 0, 0]}
        rotation={[0, DEG2RAD(180) + angleRad, 0]}
        pivot={leftPagePivot}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="red"
          side={THREE.DoubleSide}
          roughness={0.4}
        />

        {/* V-fold arm (left page child) */}
        <mesh
          position={[-0.25, 0, 0]}
          rotation={[0, -angleRad, 0]}
          pivot={foldPivot}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial
            color="green"
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>
      </mesh>

      {/* Right page — static */}
      <mesh visible={showRight} position={[0.5, 0, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="yellow"
          side={THREE.DoubleSide}
          roughness={0.4}
        />

        {/* V-fold arm (right page child) */}
        <mesh
          position={[-0.25, 0, 0]}
          rotation={[0, angleRad, 0]}
          pivot={foldPivot}
        >
          <planeGeometry args={[0.5, 0.5]} />
          <meshStandardMaterial
            color="blue"
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>
      </mesh>
    </>
  );
}
