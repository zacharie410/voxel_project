const getBlockNeighbor = (
  worldMatrix,
  chunkSize,
  chunkX,
  chunkY,
  chunkZ,
  blockX,
  blockY,
  blockZ,
  transformX,
  transformY,
  transformZ
) => {
  let x = blockX + transformX;
  let y = blockY + transformY;
  let z = blockZ + transformZ;

  let neighborChunkX = chunkX;
  let neighborChunkY = chunkY;
  let neighborChunkZ = chunkZ;
  if (x < 0) {
    neighborChunkX--;
    x += chunkSize;
  } else if (x >= chunkSize) {
    neighborChunkX++;
    x -= chunkSize;
  }
  if (y < 0) {
    neighborChunkY--;
    y += chunkSize;
  } else if (y >= chunkSize) {
    neighborChunkY++;
    y -= chunkSize;
  }
  if (z < 0) {
    neighborChunkZ--;
    z += chunkSize;
  } else if (z >= chunkSize) {
    neighborChunkZ++;
    z -= chunkSize;
  }

  if (worldMatrix[neighborChunkX]?.[neighborChunkY]?.[neighborChunkZ]) {
    return worldMatrix[neighborChunkX][neighborChunkY][neighborChunkZ].voxels[
      x
    ][y][z];
  } else {
    return null;
  }
};

export default getBlockNeighbor;
