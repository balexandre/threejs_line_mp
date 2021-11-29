import * as THREE from 'https://unpkg.com/three@0.124.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js';
import { lineMP } from '../lineMP.mjs';

// cores
const VERMELHO = 0xff0000;
const AMARELO = 0xffff00;
const AZUL = 0x0000ff;
const PRETO = 0x000000;
const CINZA = 0xf0f0f0;
const GRID_AZUL = 0x9289b4;
const GRID_VERMELHO = 0xff8866;

// dimensoes
const CUBO_SIZE = 40;
const PLAN_SIZE = 21 * CUBO_SIZE;

const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

const ROTACAO = -Math.PI / 2;

// variaveis globais
let camera;
let scene;
let renderer;
let plane;
let pointer;
let raycaster;
let controls;

let mouseMoveMesh;
let mouseMoveMaterial;

let pontosFirst;
let pontosLast;
let desenhaLinha = true;

const objects = [];

/**
 * Inicializa a pagina com os objectos
 */
function inicializa() {
	// camera
	camera = new THREE.PerspectiveCamera(45, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
	camera.position.set(-100, 1000, 800);
	camera.lookAt(0, 0, 0);

	// cenario
	scene = new THREE.Scene();
	scene.background = new THREE.Color(CINZA);

	// quadrado apontador
	const mouseMoveGeo = new THREE.BoxGeometry(CUBO_SIZE, 0, CUBO_SIZE);
	mouseMoveMaterial = new THREE.MeshBasicMaterial({
		color: VERMELHO,
		opacity: 0.5,
		transparent: true,
	});
	mouseMoveMesh = new THREE.Mesh(mouseMoveGeo, mouseMoveMaterial);
	scene.add(mouseMoveMesh);

	// intersecao de objetos
	raycaster = new THREE.Raycaster();
	pointer = new THREE.Vector2();

	// plano
	const geometry = new THREE.PlaneGeometry(PLAN_SIZE, PLAN_SIZE);
	geometry.rotateX(ROTACAO);
	plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
	scene.add(plane);

	// plano
	const grid = new THREE.PlaneGeometry(CUBO_SIZE, CUBO_SIZE);
	const colorir = {
		PAR: new THREE.LineBasicMaterial({ color: GRID_AZUL, linewidth: 10 }),
		IMPAR: new THREE.LineBasicMaterial({ color: GRID_VERMELHO, linewidth: 10 }),
	};
	let square;
	for (let x = -10; x < 11; x += 1) {
		for (let z = -10; z < 11; z += 1) {
			const linha = (x + z) % 2 === 0 ? colorir.PAR : colorir.IMPAR;
			square = new THREE.Mesh(grid, linha);
			square.position.x = x * 40;
			square.position.z = z * 40;
			square.position.y = 0;
			square.rotateX(ROTACAO);
			scene.add(square);
		}
	}

	objects.push(plane);

	// linha referencial y
	const materialY = new THREE.LineBasicMaterial({ color: VERMELHO });
	const coordenadasY = [];
	coordenadasY.push(new THREE.Vector3(0, 0, 0));
	coordenadasY.push(new THREE.Vector3(0, 0, -PLAN_SIZE / 2));

	const geometryY = new THREE.BufferGeometry().setFromPoints(coordenadasY);
	const line = new THREE.Line(geometryY, materialY);
	scene.add(line);

	// linha referencial x
	const materialX = new THREE.LineBasicMaterial({ color: AZUL });
	const coordenadasX = [];
	coordenadasX.push(new THREE.Vector3(0, 0, 0));
	coordenadasX.push(new THREE.Vector3(PLAN_SIZE / 2, 0, 0));
	const geometryX = new THREE.BufferGeometry().setFromPoints(coordenadasX);
	const line2 = new THREE.Line(geometryX, materialX);
	scene.add(line2);

	// renderizacao
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	document.body.appendChild(renderer.domElement);

	// controlos
	controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.target.set(0, 0.0635, 0);
	controls.update();

	// eventos
	document.addEventListener('pointermove', onMovimentoPonteiro);
	document.addEventListener('keydown', onTeclaClick);

	window.addEventListener('resize', onWindowResize);
}
/**
 * calcula a linha de ponto intermedio usando a funcao externa
 */
function calculaLineMP() {
	return lineMP(
		{ x: pontosFirst.position.x / CUBO_SIZE, y: pontosFirst.position.z / CUBO_SIZE },
		{ x: pontosLast.position.x / CUBO_SIZE, y: pontosLast.position.z / CUBO_SIZE },
	);
}
/**
 * Adiciona o pixel ao plano
 * @param  {object} {x:number} coordenada em X
 * @param  {object} {y:number} coordenada em Y
 */
function adicionaPixel({ x, y }) {
	const pixel = new THREE.Mesh(
		new THREE.BoxGeometry(CUBO_SIZE, CUBO_SIZE / 4, CUBO_SIZE),
		new THREE.MeshBasicMaterial({
			color: AMARELO,
			opacity: 0.4,
			transparent: true,
		}),
	);
	pixel.position.add({
		x: x *= CUBO_SIZE, y: CUBO_SIZE / 8, z: y *= CUBO_SIZE,
	});
	scene.add(pixel);
	objects.push(pixel);
	renderiza();
}
/**
 * desenha o pixel onde o utilizador clicou no plano
 */
function clicaPixel() {
	const pixel = new THREE.Mesh(
		new THREE.BoxGeometry(CUBO_SIZE, 0, CUBO_SIZE),
		new THREE.MeshBasicMaterial({ color: VERMELHO }),
	);
	pixel.position.add(mouseMoveMesh.position);
	scene.add(pixel);
	objects.push(pixel);
	renderiza();

	if (desenhaLinha) {
		pontosFirst = pixel;
		desenhaLinha = false;
	} else {
		pontosLast = pixel;
		desenhaLinha = true;
		desenhaPontinhos();
	}
}

/**
 * limpa todos os objectos desenhados pelo utilizador
 */
function limpaTela() {
	objects.forEach((x) => {
		if (x.geometry.type !== 'PlaneGeometry') {
			scene.remove(x);
		}
	});
}

/**
 * remove os pontos de inicio e fim da linha
 */
function limpaPontosIniciais() {
	scene.remove(pontosFirst);
	scene.remove(pontosLast);
}

/**
 * desenha a linha entr o ponto inicial e fim
 */
function desenhaLinhaEntrePontos() {
	const material = new THREE.LineBasicMaterial({ color: PRETO });
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

/**
 * desenha os pixels entre o ponto inicial e o de fim
 */
function desenhaPontinhos() {
	limpaPontosIniciais();
	const drawPoints = calculaLineMP();
	drawPoints.forEach((ponto) => adicionaPixel(ponto));
	desenhaLinhaEntrePontos();
	renderiza();
}

function onTeclaClick(event) {
	switch (event.code) {
		case 'Backspace':
			limpaTela();
			renderiza();
			break;
		case 'KeyX':
			clicaPixel();
			break;
	}
}

/**
 * desenha a posicao do ponteiro no plano
 * @param  {MouseEvent} event
 */
function onMovimentoPonteiro(event) {
	const x = (event.clientX / SCREEN_WIDTH) * 2 - 1;
	const y = -(event.clientY / SCREEN_HEIGHT) * 2 + 1;
	pointer.set(x, y);

	raycaster.setFromCamera(pointer, camera);

	const intersects = raycaster.intersectObjects(objects, false);

	if (intersects.length > 0) {
		const intersect = intersects[0];

		if (intersect.face.normal) {
			mouseMoveMesh.position.copy(intersect.point).add(intersect.face?.normal);
			mouseMoveMesh.position.divideScalar(CUBO_SIZE).floor().multiplyScalar(CUBO_SIZE);
			mouseMoveMesh.position.y = 0;
		}
	}

	renderiza();
}

/**
 * renderiza o plano quando o utilizador moodifica a janela
 */
function onWindowResize() {
	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	renderiza();
}

/**
 * renderiza o cenario
 */
function renderiza() {
	renderer.render(scene, camera);
}

// inicializa & renderiza o scenario inicial
inicializa();
renderiza();
