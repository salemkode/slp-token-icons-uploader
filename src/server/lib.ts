import sharp from "sharp";

export async function resize(
  path: string,
  size: number,
  name: string,
  original: boolean = false
) {
  // Folder of  icon will put init
  let folder: string = original ? "original" : String(size);

  // sharp photo
  return await sharp(path)
    .resize(size, size)
    .toFile(`cache/repo/${folder}/${name}.png`);
}
