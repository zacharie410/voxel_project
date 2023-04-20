import renderChunkInstances from "./modules/renderChunkInstances.js";

// Set the size of the world in chunks
var worldSize = 20;
var worldSizeY = 3;
// Set the size of each chunk in blocks
var chunkSize = 16;
// Set the render distance in chunks
var renderDistance = 12;
// Set the size of each voxel
var voxelSize = 1;
// Initialize Simplex noise generator
noise.seed(Math.random());
// Create the world matrix
var worldMatrix = [];

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var camera = null;

// Define Block constructor
function Block(type) {
  this.type = type;
}

const createScene = function () {
  let scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0, 0, 0);

  camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 5, -10),
    scene
  );
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, true);

  let light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.7;

  return scene;
};

var scene = createScene();

// Define materials
var materials = {
  dirt: new BABYLON.StandardMaterial("dirtMaterial", scene),
  grass: new BABYLON.StandardMaterial("grassMaterial", scene),
  stone: new BABYLON.StandardMaterial("stoneMaterial", scene),
};

materials["dirt"].diffuseColor = new BABYLON.Color3(0.5, 0.3, 0.1);
materials["grass"].diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
materials["stone"].diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);

// Loop through each chunk in the world
for (let cx = 0; cx < worldSize; cx++) {
  worldMatrix[cx] = [];
  for (let cy = 0; cy < worldSizeY; cy++) {
    worldMatrix[cx][cy] = [];
    for (let cz = 0; cz < worldSize; cz++) {
      // Create a new chunk
      let chunk = [];
      let voxelMaterialInstances = [];

      for (let key in materials) {
        if (materials.hasOwnProperty(key)) {
          let material = materials[key];

          // Create voxel geometry
          let voxelGeometry = BABYLON.MeshBuilder.CreateBox(
            "voxelGeometry",
            { size: 1 },
            scene
          );
          voxelGeometry.material = material;
          // Create voxel instances
          let voxelInstances = new BABYLON.InstancedMesh(
            "voxelInstances",
            voxelGeometry,
            0,
            scene,
            true
          );

          voxelMaterialInstances[key] = {
            geometry: voxelGeometry,
            instances: voxelInstances,
          };
        }
      }
      // Loop through each block in the chunk
      for (var bx = 0; bx < chunkSize; bx++) {
        chunk[bx] = [];
        for (var by = 0; by < chunkSize; by++) {
          chunk[bx][by] = [];
          for (var bz = 0; bz < chunkSize; bz++) {
            // Get the noise value for this block
            let noiseValue = noise.perlin3(
              (bx + cx * chunkSize) / 50,
              (by + cy * chunkSize) / 50,
              (bz + cz * chunkSize) / 50
            );

            // Set the block type based on the noise value
            let blockType = "air";
            if (noiseValue > 0.5) {
              blockType = "stone";
            } else if (noiseValue > 0.3) {
              blockType = "dirt";
            } else if (noiseValue > 0.1) {
              blockType = "grass";
            }

            // Create the block object
            let block = new Block(blockType);

            // Add the block to the chunk
            chunk[bx][by].push(block);
          }
        }
      }

      let chunkObj = { instances: voxelMaterialInstances, voxels: chunk };
      // Add the chunk to the world matrix
      worldMatrix[cx][cy].push(chunkObj);
    }
  }
}

function getChunk(worldMatrix, chunkX, chunkY, chunkZ) {
  return worldMatrix[chunkX][chunkY][chunkZ];
}

function getChunkForPosition(position) {
  var chunkX = Math.floor(position.x / (chunkSize * voxelSize));
  var chunkY = Math.floor(position.y / (chunkSize * voxelSize));
  var chunkZ = Math.floor(position.z / (chunkSize * voxelSize));
  return { x: chunkX, y: chunkY, z: chunkZ };
}

const unloadChunk = (chunk) => {
  for (let key in materials) {
    if (materials.hasOwnProperty(key)) {
      chunk.instances[key].instances.dispose();
    }
  }
};
const loadedChunks = new Array(worldSize)
  .fill()
  .map(() =>
    new Array(worldSizeY).fill().map(() => new Array(worldSize).fill(false))
  );
function updateVisibleChunks(playerPosition) {
  // Compute the player's chunk coordinates
  let playerChunk = getChunkForPosition(playerPosition);

  // Compute the visible chunk coordinates based on the player's position and the render distance
  let visibleChunks = [];
  for (let x = -renderDistance; x <= renderDistance; x++) {
    for (let y = -renderDistance; y <= renderDistance; y++) {
      for (let z = -renderDistance; z <= renderDistance; z++) {
        let chunkX = playerChunk.x + x;
        let chunkY = playerChunk.y + y;
        let chunkZ = playerChunk.z + z;
        if (
          chunkX >= 0 &&
          chunkX < worldSize &&
          chunkY >= 0 &&
          chunkY < worldSizeY &&
          chunkZ >= 0 &&
          chunkZ < worldSize
        ) {
          visibleChunks.push([chunkX, chunkY, chunkZ]);
        }
      }
    }
  }

  // Loop through all the loaded chunks and unload the ones that are no longer visible
  loadedChunks.forEach(function (rows, cx) {
    rows.forEach(function (cols, cy) {
      cols.forEach(function (loaded, cz) {
        if (
          loaded &&
          !visibleChunks.some(([x, y, z]) => x === cx && y === cy && z === cz)
        ) {
          loadedChunks[cx][cy][cz] = false;
          let chunk = getChunk(worldMatrix, cx, cy, cz);
          if (chunk) {
            unloadChunk(chunk);
          }
        }
      });
    });
  });

  // Loop through all the visible chunks and load the ones that are not yet loaded
  visibleChunks.forEach(function ([cx, cy, cz]) {
    if (!loadedChunks[cx][cy][cz]) {
      loadedChunks[cx][cy][cz] = true;
      let chunk = getChunk(worldMatrix, cx, cy, cz);
      if (chunk) {
        renderChunkInstances(
          worldMatrix,
          chunkSize,
          chunk.instances,
          voxelSize,
          chunk.voxels,
          cx,
          cy,
          cz
        );
      }
    }
  });
}

let lastUpdate = 0;

function update() {
  const now = performance.now();
  if (now - lastUpdate >= 1000) {
    lastUpdate = now;
    const playerPosition = camera.position;
    updateVisibleChunks(playerPosition);
  }
}

// Run the update loop every frame
engine.runRenderLoop(function () {
  scene.render();
  update();
});

// Resize the canvas when the window is resized
window.addEventListener("resize", function () {
  engine.resize();
});
