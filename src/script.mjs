/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
// import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import * as THREE from './three.module.js';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

const material = new THREE.LineBasicMaterial();
material.color = new THREE.Color(0xbada22);

// linha
const points = [];

const geometry = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line(geometry, material);
scene.add(line);

// tamanho
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const sphere = new THREE.Mesh(geometry, material);
// scene.add(sphere)

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera);

const geometry2 = new THREE.BoxGeometry();
const material2 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry2, material2);
scene.add(cube);

camera.position.z = 5;

// controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// renderizacao
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// animacao
const clock = new THREE.Clock();
const tick = () => {
	const elapsedTime = clock.getElapsedTime();
	sphere.rotation.y = 0.5 * elapsedTime;
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};

tick();
/*
*/
