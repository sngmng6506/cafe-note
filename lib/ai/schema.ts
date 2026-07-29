import { z } from "zod";

export const PhotoCategory = z.enum([
  "exterior",
  "interior",
  "menu",
  "drink",
  "food",
  "detail",
  "other"
]);

export const CafeReviewResultSchema = z.object({
  titleOptions: z.array(z.string().min(1).max(80)).length(3),
  summary: z.string().min(1).max(150),
  body: z.string().min(100).max(5000),
  tags: z.array(z.string().min(1).max(30)).max(10),
  photoPlan: z.array(
    z.object({
      sourceIndex: z.number().int().min(1),
      recommendedOrder: z.number().int().min(1),
      category: PhotoCategory,
      description: z.string().min(1).max(150),
      insertAfterParagraph: z.number().int().min(0),
      optionalCaption: z.string().max(100).nullable()
    })
  ),
  warnings: z.array(z.string().min(1).max(200)).max(5)
});

export type CafeReviewResult = z.infer<typeof CafeReviewResultSchema>;

export function validatePhotoPlan(result: CafeReviewResult, photoCount: number) {
  if (photoCount === 0 && result.photoPlan.length > 0) {
    throw new Error("사진이 없는데 사진 계획이 반환됐습니다.");
  }
  const sourceIndexes = new Set<number>();
  const orders = new Set<number>();
  for (const item of result.photoPlan) {
    if (item.sourceIndex > photoCount) throw new Error("존재하지 않는 사진 번호가 포함됐습니다.");
    if (sourceIndexes.has(item.sourceIndex)) throw new Error("사진 번호가 중복됐습니다.");
    sourceIndexes.add(item.sourceIndex);
    if (orders.has(item.recommendedOrder)) throw new Error("추천 순번이 중복됐습니다.");
    orders.add(item.recommendedOrder);
  }
  [...orders].sort((a, b) => a - b).forEach((order, index) => {
    if (order !== index + 1) throw new Error("추천 순번은 1부터 이어져야 합니다.");
  });
}
