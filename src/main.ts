import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

const gui = new GUI();

const canvas: HTMLCanvasElement | null = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("No canvas found");
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const light = new THREE.HemisphereLight(0xfff, 0x000, 1);
scene.add(light);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
  canvas,
});

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
renderer.setSize(sizes.width, sizes.height);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
  color: 0xfff,
  roughness: 0.4,
});
const cube = new THREE.Mesh(geometry, material);

scene.add(cube);

gui.add(cube, "visible");

camera.position.z = 5;

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);

  controls.update();
});

const animate = () => {
  controls.update();
  renderer.render(scene, camera);
};

renderer.setAnimationLoop(animate);
