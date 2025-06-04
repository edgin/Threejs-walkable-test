import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Pathfinding } from 'three-pathfinding';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 10, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const pathfinder = new Pathfinding();
const ZONE = 'level1';
let navmesh, groupID, pathLine;
let startPos = null;
let endPos = null;
const loader = new GLTFLoader();

// Load main model
// loader.load('wlak-test.glb', (gltf) => {
//   scene.add(gltf.scene);
// });
function snapToNavmesh(point) {
  const group = pathfinder.getGroup(ZONE, point);
  if (group === null) return null;

  const closest = pathfinder.getClosestNode(point, ZONE, group);
  return closest?.centroid || null;
}
function debugPoint(position, color = 0xffff00) {
  const geo = new THREE.SphereGeometry(0.2, 8, 8);
  const mat = new THREE.MeshBasicMaterial({ color });
  const point = new THREE.Mesh(geo, mat);
  point.position.copy(position);
  scene.add(point);
}
// Load navmesh
loader.load('walk-test.glb', (gltf) => {
  navmesh = gltf.scene.children[0];
  navmesh.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
  scene.add(navmesh);
  console.log('Navmesh loaded:', navmesh);
  console.log('NavMesh triangle count:', navmesh.geometry.index?.count / 3);

  // Create zone
  const zone = Pathfinding.createZone(navmesh.geometry);
  pathfinder.setZoneData(ZONE, zone);
  groupID = 0;
});

// Click to set start/end and draw path
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', (event) => {
  if (!navmesh) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(navmesh);

  if (intersects.length === 0) {
    console.warn('No intersection with navmesh.');
    return;
  }

  const clickedPoint = intersects[0].point;
  const snapped = snapToNavmesh(clickedPoint);

  if (!snapped) {
    console.warn('Clicked point not walkable.');
    return;

  }

  const group = pathfinder.getGroup(ZONE, snapped);
  console.log(`Clicked groupID: ${group}`);

  if (!startPos) {
    startPos = snapped;
    debugPoint(startPos, 0x00ff00); // green
    console.log('Start set:', startPos);
  } else {
    endPos = snapped;
    debugPoint(endPos, 0xff0000); // red
    console.log('End set:', endPos);

    const path = pathfinder.findPath(startPos, endPos, ZONE, groupID);
    console.log('Path result:', path);
    console.log(
      'Group start:', pathfinder.getGroup(ZONE, startPos),
      'Group end:', pathfinder.getGroup(ZONE, endPos)
    );

    if (!path || path.length < 2) {
      console.warn('⚠️ No valid path found.');
      startPos = null;
      endPos = null;
      return;
    }

    if (pathLine) scene.remove(pathLine);

    const curve = new THREE.CatmullRomCurve3(path);
    const geometry = new THREE.TubeGeometry(curve, 50, 0.1, 8, false);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    pathLine = new THREE.Mesh(geometry, material);
    scene.add(pathLine);

    startPos = null;
    endPos = null;

    // console.log(
    //   'Group start:', pathfinder.getGroup(ZONE, startPos),
    //   'Group end:', pathfinder.getGroup(ZONE, endPos)
    // );
  }
});


function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
animate();
