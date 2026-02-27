import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";

const gui = new GUI();
const axesHelper = new THREE.AxesHelper(5);

const canvas: HTMLCanvasElement | null = document.querySelector("canvas.webgl");
if (!canvas) {
  throw new Error("No canvas found");
}
const scene = new THREE.Scene();
scene.add(axesHelper);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const hemiLight = new THREE.HemisphereLight("white", "blue", 1);
const ambientLight = new THREE.AmbientLight("white", 1);

scene.add(hemiLight);
scene.add(ambientLight);

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

const rightPageGeometry = new THREE.PlaneGeometry(1, 1);
const rightPageMaterial = new THREE.MeshStandardMaterial({
  color: "yellow",
  side: THREE.DoubleSide,
  roughness: 0.4,
});

const leftPageGeometry = rightPageGeometry.clone();
const leftPageMaterial = rightPageMaterial.clone();
leftPageMaterial.color.set("red");

const leftPage = new THREE.Mesh(leftPageGeometry, leftPageMaterial);
const rightPage = new THREE.Mesh(rightPageGeometry, rightPageMaterial);

leftPage.pivot = new THREE.Vector3(-0.5, 0.5, 0);
leftPage.position.x = 0.5;
rightPage.position.x = 0.5;

const parallelogramLeftGeometry = new THREE.PlaneGeometry(0.5, 0.5);
const parallelogramLeftMaterial = new THREE.MeshStandardMaterial({
  color: "green",
  side: THREE.DoubleSide,
  roughness: 0.4,
});
const parallelogramLeft = new THREE.Mesh(
  parallelogramLeftGeometry,
  parallelogramLeftMaterial,
);

parallelogramLeft.pivot = new THREE.Vector3(0.25, 0, 0);
parallelogramLeft.position.x = -0.25;
parallelogramLeft.position.y = 0;
parallelogramLeft.position.z = 0;
parallelogramLeft.rotation.x = THREE.MathUtils.degToRad(0);
parallelogramLeft.rotation.y = THREE.MathUtils.degToRad(0);
parallelogramLeft.rotation.z = THREE.MathUtils.degToRad(0);

const parallelogramRightGeometry = new THREE.PlaneGeometry(0.5, 0.5);
const parallelogramRightMaterial = new THREE.MeshStandardMaterial({
  color: "blue",
  side: THREE.DoubleSide,
  roughness: 0.4,
});
const parallelogramRight = new THREE.Mesh(
  parallelogramRightGeometry,
  parallelogramRightMaterial,
);

parallelogramRight.pivot = new THREE.Vector3(0.25, 0, 0);
parallelogramRight.position.x = -0.25;
parallelogramRight.position.y = 0;
parallelogramRight.position.z = 0;
parallelogramRight.rotation.x = THREE.MathUtils.degToRad(0);
parallelogramRight.rotation.y = THREE.MathUtils.degToRad(0);
parallelogramRight.rotation.z = THREE.MathUtils.degToRad(0);

leftPage.add(parallelogramLeft);
rightPage.add(parallelogramRight);

scene.add(leftPage, rightPage);

camera.position.z = 5;

const parameters = {
  pageAngle: 0,
};

gui.add(leftPage, "visible").name("Left");
gui.add(rightPage, "visible").name("Right");
leftPage.rotation.y = THREE.MathUtils.degToRad(180);

gui.add(parameters, "pageAngle", 0, 180, 0.01).onChange((value: number) => {
  leftPage.rotation.y = THREE.MathUtils.degToRad(180 + value);

  parallelogramLeft.rotation.y = THREE.MathUtils.degToRad(-value);

  parallelogramRight.rotation.y = THREE.MathUtils.degToRad(value);
});

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
