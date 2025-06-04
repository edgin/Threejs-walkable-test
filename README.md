=========================================
Walkable Surface Pathfinding – Three.js
=========================================

This demo loads a navmesh exported from Blender (via Recast),
then uses three-pathfinding to let the user click two points
and visualize the path between them.

---

## FILE STRUCTURE OVERVIEW

/public
└── navmesh.glb ← exported from Blender

/src
└── main.js ← core logic (scene, loader, pathfinding)

index.html ← sets up canvas and script
README.txt ← this file

---

## SETUP INSTRUCTIONS

1. Place `navmesh.glb` into your `/public` or asset folder

2. Make sure your Three.js app includes:

   - `three`
   - `three-pathfinding`
   - `GLTFLoader`

3. In `main.js`, load the navmesh:
   const loader = new GLTFLoader();
   loader.load('navmesh.glb', (gltf) => {
   const navmesh = gltf.scene.children[0];
   scene.add(navmesh); // optional: for debug

   const zone = Pathfinding.createZone(navmesh.geometry);
   pathfinder.setZoneData('level1', zone);
   });

4. Implement raycasting on mouse click to capture 3D positions

5. When two points are clicked:
   - Use `pathfinder.getClosestNode()` to find walkable nodes
   - Use `pathfinder.findPath()` to calculate the path
   - Draw the path using a `THREE.Line`

---

## TESTING WALKABILITY

✅ Start and end points must be on the navmesh  
✅ Path result should be an array with multiple `_Vector3` points  
✅ If only 1 point returns → path is invalid or surface is disconnected  
✅ Display errors or fallback messages when no valid path is found

Example log:
Path result: [Vector3, Vector3, ...]
Group ID: 0 → 0

---

## TIPS

- Display navmesh in wireframe to debug:
  navmesh.material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
  transparent: true,
  opacity: 0.5,
  });

- Confirm that the pathfinder's zone is properly set:
  console.log(Pathfinding.zones)

- To debug walkability in devtools:
  console.log(pathResult.length)

---

## DEPENDENCIES

- three.js (r155+ recommended)
- three-pathfinding: https://github.com/donmccurdy/three-pathfinding
- GLTFLoader: from examples/jsm/loaders/

---

## LICENSE

MIT License (for three-pathfinding and example usage)
You are free to use and modify this example for any project.
