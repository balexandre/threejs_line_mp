/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
// import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import * as THREE from './three.module.js';
import { lineMP } from '../lineMP.mjs';

let camera;
let scene;
let renderer;
let plane;
let pointer;
let raycaster;
let controls;

let rollOverMesh;
let rollOverMaterial;
let cubeGeo;
let cubeMaterial;

let pontosFirst;
let pontosLast;
let readyForPoints = true;

const objects = [];

function init() {
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(100, 1500, 1000);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  const rollOverGeo = new THREE.BoxGeometry(50, 50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  scene.add(rollOverMesh);

  // cubes

  cubeGeo = new THREE.BoxGeometry(50, 50, 50);
  cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xbaa55 });

  // grid

  const gridHelper = new THREE.GridHelper(1050, 21, 0x000000, 0x00ff00);
  scene.add(gridHelper);

  //

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry(1050, 1050);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(plane);

  objects.push(plane);

  const material2 = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(0, 0, -1050 / 2));

  const geometry2 = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry2, material2);
  scene.add(line);

  const material3 = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const points2 = [];
  points2.push(new THREE.Vector3(0, 0, 0));
  points2.push(new THREE.Vector3(1050 / 2, 0, 0));

  const geometry3 = new THREE.BufferGeometry().setFromPoints(points2);
  const line2 = new THREE.Line(geometry3, material3);
  scene.add(line2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.0635, 0);
  controls.update();

  animate();

  document.addEventListener('pointermove', onPointerMove);
  // document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onDocumentKeyDown);

  //

  window.addEventListener('resize', onWindowResize);
}

function calculateLineMP() {
  // addPoint({ x: 3, y: 0 });
  const result = lineMP(
    { x: pontosFirst.x / 50, y: pontosFirst.z / 50 },
    { x: pontosLast.x / 50, y: pontosLast.z / 50 },
  );
  // const expected = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }];
  result.forEach((ponto) => {
    addPoint(ponto);
  });
}

function animate() {
  requestAnimationFrame(animate);

  // required if controls.enableDamping or controls.autoRotate are set to true
  controls.update();

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function onPointerMove(event) {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  pointer.set(x, y);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects, false);
  // console.log({ x, y, intersects });

  if (intersects.length > 0) {
    const intersect = intersects[0];

    rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
    rollOverMesh.position.divideScalar(50).floor().multiplyScalar(50);
  }

  render();
}

function addPoint({ x, y }) {
  const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
  voxel.position.add({
    x: x *= 50, y: 0, z: y *= 50,
  }); // .addScalar(25);
  scene.add(voxel);
  objects.push(voxel);
  console.log('addPoint', voxel.position);
  render();
}
function clickPoint() {
  const voxel = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({ color: 0xff0000 }));
  voxel.position.add(rollOverMesh.position);
  scene.add(voxel);
  objects.push(voxel);
  console.log('addPoint', voxel.position);
  render();

  if (readyForPoints) {
    pontosFirst = voxel.position;
    readyForPoints = false;
  } else {
    pontosLast = voxel.position;
    calculateLineMP();
    readyForPoints = true;
  }
}

function onPointerDown(event) {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;
  pointer.set(x, y);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects, false);

  if (intersects.length > 0) {
    const intersect = intersects[0];

    console.log({ intersect });
    const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
    voxel.position.copy(intersect.point).add(intersect.face.normal);
    voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    scene.add(voxel);

    objects.push(voxel);

    render();
  }
}

function onDocumentKeyDown(event) {
  switch (event.code) {
    case 'KeyX':
      clickPoint();
      break;
  }
}

function render() {
  renderer.render(scene, camera);
}

init();
render();
