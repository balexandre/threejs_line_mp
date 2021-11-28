import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js'


const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const material = new THREE.LineBasicMaterial()
material.color = new THREE.Color(0xbada22)

// linha
const points = [];
points.push( new THREE.Vector3( - 100, 0, 0 ) );
points.push( new THREE.Vector3( 0, 100, 0 ) );
points.push( new THREE.Vector3( 100, 0, 0 ) );

const geometry = new THREE.BufferGeometry().setFromPoints( points );

const line = new THREE.Line( geometry, material );
scene.add(line);

// tamanho
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
}

const sphere = new THREE.Mesh(geometry, material)
// scene.add(sphere)

// luzes
const pointLight = new THREE.PointLight(0xffffff, .1)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
scene.add(pointLight)

// resize
window.addEventListener('resize', () => {
	
})

// camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 100)
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2;
scene.add(camera)

// controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// renderizacao
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// animacao
const clock = new THREE.Clock()
const tick = () => {
	const elapsedTime = clock.getElapsedTime()
	sphere.rotation.y = .5 * elapsedTime
	controls.update()
	renderer.render(scene, camera)
	window.requestAnimationFrame(tick)
}

tick()
/*
*/