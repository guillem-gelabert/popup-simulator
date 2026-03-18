import "./style.css";
import ReactDOM from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import Book from "./Book";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import ViewportGizmoHelper from "./helpers/ViewportGizmo";

const root = ReactDOM.createRoot(
  document.querySelector("#root") as HTMLElement,
);

root.render(
  <Canvas
    shadows
    camera={{
      fov: 80,
      near: 0.1,
      far: 200,
      position: [0, 8, 8],
    }}
  >
    <Perf position="top-left" />
    <OrbitControls makeDefault />

    <Book />
    <ViewportGizmoHelper />
  </Canvas>,
);
