import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Leva } from "leva";
import { Card } from "./components/Card";

export default function App() {
  return (
    <>
      <Leva />
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 1000, position: [0, 0, 5] }}
      >
        <hemisphereLight args={["white", "blue", 1]} />
        <ambientLight args={["white", 1]} />
        <axesHelper args={[5]} />
        <OrbitControls enableDamping />
        <Card />
      </Canvas>
    </>
  );
}
