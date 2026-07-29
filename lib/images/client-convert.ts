import type { PreparedImage } from "@/lib/images/types";

const MAX_EDGE = 1280;
const QUALITY = 0.78;

function isHeic(file: File) {
  return /hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

async function convertHeic(file: File) {
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: QUALITY });
  return Array.isArray(blob) ? blob[0] : blob;
}

async function resizeImage(blob: Blob, name: string) {
  const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("이미지를 처리하지 못했어요.");
  context.drawImage(bitmap, 0, 0, width, height);
  const output = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
  bitmap.close();
  if (!output) throw new Error("이미지를 JPEG로 변환하지 못했어요.");
  return new File([output], name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
}

export async function prepareImage(file: File, sourceIndex: number): Promise<PreparedImage> {
  try {
    if (file.type === "image/gif") throw new Error("GIF 애니메이션은 지원하지 않아요.");
    const source = isHeic(file) ? await convertHeic(file) : file;
    if (!["image/jpeg", "image/png", "image/webp"].includes(source.type)) throw new Error("지원하지 않는 이미지 형식이에요.");
    const resized = await resizeImage(source, file.name);
    if (resized.size > 2 * 1024 * 1024) throw new Error("사진 한 장은 변환 후 2MB 이하여야 해요.");
    return {
      id: `${Date.now()}-${sourceIndex}-${file.name}`,
      sourceIndex,
      file: resized,
      previewUrl: URL.createObjectURL(resized),
      status: "ready"
    };
  } catch (error) {
    return {
      id: `${Date.now()}-${sourceIndex}-${file.name}`,
      sourceIndex,
      file,
      previewUrl: "",
      status: "error",
      error: error instanceof Error ? error.message : "사진을 처리하지 못했어요."
    };
  }
}
