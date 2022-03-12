import sharp from "sharp";

/*
 * inline function
 */
async function resize(path: string, size: number, txid: string) {
  // resize image
  return await sharp(path)
    .clone()
    .resize(size, size)
    .toFile(`cache/repo/${String(size)}/${txid}.png`);
}

/*
 * exports function
 */
async function isFileSupport(_path: string) {
  try {
    await sharp(_path).stats();
    return true;
  } catch (error) {
    return false;
  }
}

export { isFileSupport };

//
export async function isSquare(_path: string) {
  let isSupport = await isFileSupport(_path);

  // Stop check is square if file not support
  if (!isSupport) {
    return false;
  }

  // Get metadata from image
  const image = sharp(_path);
  const metadata = await image.metadata();

  // Check that the height and width are equal
  return metadata.width === metadata.height;
}

//
export async function resizeImage(
  _path: string,
  sizes: number | number[],
  txid: string
) {
  //
  if (typeof sizes === "number") {
    // Resize if sizes is not array
    await resize(_path, sizes, txid);
  } else {
    // Resize array of sizes
    for (let size of sizes) {
      await resize(_path, size, txid);
    }
  }
}

//
export async function resizeOrigin(_path: string, txid: string) {
  const metadata = await sharp(_path).metadata();

  // Get Size of image from metadata
  let size = metadata.width;

  // Move svg image to svg folder
  // Set size 1000 if type of image is svg
  // Because the svg format is often in small sizes
  if (metadata.format === "svg") {
    size = 1000;
    await sharp(_path).toFile(`cache/repo/svg/${txid}.svg`);
  }

  //
  return await sharp(_path)
    .resize(size, size)
    .toFile(`cache/repo/original/${txid}.png`);
}
