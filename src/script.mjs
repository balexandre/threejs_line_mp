/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
// import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import * as THREE from './three.module.js';
import { lineMP } from '../lineMP.mjs';

const VERMELHO = 0xff0000;
const AMARELO = 0xffff00;

const CUBO_SIZE = 40;
const PLAN_SIZE = 21 * CUBO_SIZE;

let camera;
let scene;
let renderer;
let plane;
let pointer;
let raycaster;
let controls;

let mouseMoveMesh;
let mouseMoveMaterial;
let clickBox;
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

	const mouseMoveGeo = new THREE.BoxGeometry(CUBO_SIZE, 0, CUBO_SIZE);
	mouseMoveMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  });
	mouseMoveMesh = new THREE.Mesh(mouseMoveGeo, mouseMoveMaterial);
	scene.add(mouseMoveMesh);

	clickBox = new THREE.BoxGeometry(CUBO_SIZE, 0, CUBO_SIZE);

	const gridHelper = new THREE.GridHelper(PLAN_SIZE, 21, 0x000000, 0x00ff00);
  scene.add(gridHelper);

  //

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

	const geometry = new THREE.PlaneGeometry(PLAN_SIZE, PLAN_SIZE);
  geometry.rotateX(-Math.PI / 2);

  plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
  scene.add(plane);

  objects.push(plane);

  const material2 = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
	points.push(new THREE.Vector3(0, 0, -PLAN_SIZE / 2));

  const geometry2 = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry2, material2);
  scene.add(line);

  const material3 = new THREE.LineBasicMaterial({ color: 0x0000ff });
  const points2 = [];
  points2.push(new THREE.Vector3(0, 0, 0));
	points2.push(new THREE.Vector3(PLAN_SIZE / 2, 0, 0));

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
	  { x: pontosFirst.position.x / CUBO_SIZE, y: pontosFirst.position.z / CUBO_SIZE },
	  { x: pontosLast.position.x / CUBO_SIZE, y: pontosLast.position.z / CUBO_SIZE },
  );
  // const expected = [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 1 }, { x: 3, y: 1 }];
	return result;
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

  if (intersects.length > 0) {
    const intersect = intersects[0];

	  mouseMoveMesh.position.copy(intersect.point).add(intersect.face.normal);
	  mouseMoveMesh.position.divideScalar(CUBO_SIZE).floor().multiplyScalar(CUBO_SIZE);
	  mouseMoveMesh.position.y = 0;
  }

  render();
}

function addPoint({ x, y }) {
	const voxel = new THREE.Mesh(
		new THREE.BoxGeometry(CUBO_SIZE, CUBO_SIZE / 4, CUBO_SIZE),
		new THREE.MeshBasicMaterial({
			color: AMARELO,
			opacity: 0.4,
			transparent: true,
	}),
  );
  voxel.position.add({
	  x: x *= CUBO_SIZE, y: CUBO_SIZE / 8, z: y *= CUBO_SIZE,
  });
  scene.add(voxel);
	objects.push(voxel);
  render();
}
function clickPoint() {
	const voxel = new THREE.Mesh(clickBox, new THREE.MeshBasicMaterial({ color: VERMELHO }));
	voxel.position.add(mouseMoveMesh.position);
  scene.add(voxel);
	objects.push(voxel);
  render();

  if (readyForPoints) {
	  pontosFirst = voxel;
    readyForPoints = false;
  } else {
	  pontosLast = voxel;
	  desenhaPontinhos();
    readyForPoints = true;
  }
}

function limpaTela() {
	objects.forEach((x) => {
		if (x.geometry.type !== 'PlaneGeometry') {
			scene.remove(x);
		}
	});
}

function limpaPontosIniciais() {
	scene.remove(pontosFirst);
	scene.remove(pontosLast);
}

function desenhaLinhaEntrePontos() {
	const material = new THREE.LineBasicMaterial({ color: 0x000000 });
	const points = [];
	points.push(new THREE.Vector3(
		pontosFirst.position.x,
	  0,
	  pontosFirst.position.z,
  ));
	points.push(new THREE.Vector3(
		pontosLast.position.x,
	  0,
	  pontosLast.position.z,
  ));

	const geometry = new THREE.BufferGeometry().setFromPoints(points);
	const line = new THREE.Line(geometry, material);
	scene.add(line);
	objects.push(line);
}

function desenhaPontinhos() {
	limpaPontosIniciais();
	const drawPoints = calculateLineMP();
	drawPoints.forEach((ponto) => addPoint(ponto));
	desenhaLinhaEntrePontos();
}

function onDocumentKeyDown(event) {
  switch (event.code) {
	  case 'Backspace':
		  limpaTela();
		  break;
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
