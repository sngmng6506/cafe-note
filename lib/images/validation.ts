export const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function sniffImageType(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) return "image/webp";
  return "unknown";
}

export async function validateServerImages(files: File[], options: { maxCount: number; maxSizeMb: number; maxTotalMb: number }) {
  if (files.length > options.maxCount) throw new Error(`사진은 최대 ${options.maxCount}장까지 선택할 수 있어요.`);
  let total = 0;
  for (const file of files) {
    total += file.size;
    if (file.size > options.maxSizeMb * 1024 * 1024) throw new Error(`사진 한 장은 ${options.maxSizeMb}MB 이하여야 해요.`);
    const sniffed = await sniffImageType(file);
    if (!allowedMimeTypes.has(file.type) || sniffed !== file.type) throw new Error("지원하지 않거나 파일 형식이 올바르지 않은 이미지가 있어요.");
  }
  if (total > options.maxTotalMb * 1024 * 1024) throw new Error(`전체 사진 용량은 ${options.maxTotalMb}MB 이하여야 해요.`);
}
