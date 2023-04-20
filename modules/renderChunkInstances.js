import getBlockNeighbor from "./getBlockNeighbor.js";

const renderChunkInstances = (
  worldMatrix,
  chunkSize,
  voxelMaterialInstances,
  voxelSize,
  chunk,
  chunkX,
  chunkY,
  chunkZ
) => {
  for (var x = 0; x < chunkSize; x++) {
    for (var y = 0; y < chunkSize; y++) {
      for (var z = 0; z < chunkSize; z++) {
        var block = chunk[x][y][z];
        if (block.type !== "air") {
          var neighborBlocks = [
            getBlockNeighbor(
              worldMatrix,
              chunkSize,
              chunkX,
              chunkY,
              chunkZ,
              x,
              y,
              z,
              -1,
              0,
              0
            ),
            getBlockNeighbor(
              worldMatrix,
              chunkSize,
              chunkX,
              chunkY,
              chunkZ,
              x,
              y,
              z,
              1,
              0,
              0
            ),
            getBlockNeighbor(
              worldMatrix,
              chunkSize,
              chunkX,
              chunkY,
              chunkZ,
              x,
              y,
              z,
              0,
              -1,
              0
            ),
            getBlockNeighbor(
              worldMatrix,
              chunkSize,
              chunkX,
              chunkY,
              chunkZ,
              x,
              y,
              z,
              0,
              1,
              0
            ),
            getBlockNeighbor(
              worldMatrix,
              chunkSize,
              chunkX,
              chunkY,
              chunkZ,
              x,
              y,
              z,
              0,
              0,
              -1
            ),
            getBlockNeighbor(
              worldMatrix,
              chunkSize,
              chunkX,
              chunkY,
              chunkZ,
              x,
              y,
              z,
              0,
              0,
              1
            ),
          ];
          var hasAdjacentAir = neighborBlocks.some(function (neighbor) {
            return neighbor && neighbor.type === "air";
          });
          var surrounded =
            !hasAdjacentAir &&
            neighborBlocks.every(function (neighbor) {
              return neighbor && neighbor.type !== "air";
            });

          if (!surrounded && hasAdjacentAir) {
            var position = new BABYLON.Vector3(
              (x + chunkX * chunkSize) * voxelSize,
              (y + chunkY * chunkSize) * voxelSize,
              (z + chunkZ * chunkSize) * voxelSize
            );
            var instance = voxelMaterialInstances[
              block.type
            ].geometry.createInstance(`voxel_${x}_${y}_${z}`);
            instance.position.copyFrom(position);
            instance.scaling.copyFromFloats(voxelSize, voxelSize, voxelSize);
            instance.parent = voxelMaterialInstances[block.type].instances;
          }
        }
      }
    }
  }
};

export default renderChunkInstances;
