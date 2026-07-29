import { z } from "zod";

const optionalText = (max = 300) => z.string().trim().max(max).optional().or(z.literal(""));
const textList = (maxItems = 20) => z.array(z.string().trim().min(1).max(80)).max(maxItems).default([]);

export const cafeTypeSchema = z.enum([
  "space",
  "coffee",
  "bakery",
  "work",
  "large",
  "brunch",
  "view",
  "concept",
  "neighborhood",
  "other"
]);

export const orderedItemSchema = z.object({
  name: z.string().trim().min(1, "메뉴명을 입력해 주세요.").max(80),
  price: optionalText(40),
  type: optionalText(40),
  firstImpression: optionalText(200),
  flavorTraits: textList(14),
  texture: optionalText(40),
  portion: optionalText(40),
  appearance: optionalText(60),
  value: optionalText(40),
  reorderIntent: optionalText(60),
  note: z.string().trim().min(1, "주문 메뉴 평가를 입력해 주세요.").max(500)
});

export const cafeReviewFormSchema = z.object({
  cafeType: z.array(cafeTypeSchema).max(10).default([]),
  basic: z.object({
    cafeName: z.string().trim().min(1, "카페명을 입력해 주세요.").max(80),
    area: z.string().trim().min(1, "지역 또는 지점명을 입력해 주세요.").max(80),
    visitedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "방문 날짜를 확인해 주세요."),
    visitTime: z.enum(["morning", "lunch", "afternoon", "evening", "night"], {
      required_error: "방문 시간대를 선택해 주세요."
    }),
    companion: z.enum(["alone", "friend", "partner", "family", "coworker", "other"]).default("alone"),
    visitReason: z.string().trim().min(1, "방문 이유를 입력해 주세요.").max(300)
  }),
  access: z.object({
    transport: optionalText(40),
    accessibility: optionalText(40),
    entranceNote: optionalText(300),
    parking: optionalText(60),
    parkingNote: optionalText(300),
    waiting: optionalText(60)
  }),
  exterior: z.object({
    styles: textList(12),
    firstImpression: optionalText(300)
  }),
  space: z.object({
    overallSize: optionalText(40),
    estimatedSeats: optionalText(40),
    exactSeatCount: z.number().int().positive().max(10000).optional(),
    zones: textList(12),
    seatTypes: textList(12),
    seatSpacing: optionalText(40),
    chairComfort: optionalText(40),
    tableSize: optionalText(80),
    crowdLevel: optionalText(40),
    seatAvailability: optionalText(80),
    spaceNote: optionalText(500)
  }),
  atmosphere: z.object({
    keywords: z.array(z.string().trim().min(1).max(40)).min(1, "분위기 키워드를 하나 이상 선택해 주세요.").max(5),
    materialsAndColors: optionalText(300),
    daylight: optionalText(60),
    viewType: optionalText(40),
    viewNote: optionalText(300),
    music: optionalText(60),
    noise: optionalText(40),
    temperatureAndScent: optionalText(300),
    standoutElement: z.string().trim().min(1, "가장 인상적인 공간 요소를 입력해 주세요.").max(300)
  }),
  menuOverview: z.object({
    categories: textList(12),
    priceImpression: optionalText(80),
    orderingMethod: optionalText(60),
    orderingNote: optionalText(300)
  }),
  orderedItems: z.array(orderedItemSchema).min(1, "주문 메뉴를 하나 이상 입력해 주세요.").max(8),
  usability: z.object({
    stayDuration: optionalText(40),
    outlets: optionalText(40),
    wifi: optionalText(40),
    laptopSuitability: optionalText(40),
    laptopNote: optionalText(300),
    restroom: textList(10),
    accessibilityOptions: z.record(z.string().max(40)).default({}),
    amenities: textList(12)
  }),
  service: z.object({
    staffResponse: optionalText(40),
    menuExplanation: optionalText(40),
    servingSpeed: optionalText(40),
    note: optionalText(300)
  }),
  photo: z.object({
    bestSpot: optionalText(300),
    difficulty: optionalText(80),
    recommendedSubjects: textList(12),
    note: optionalText(300)
  }),
  conclusion: z.object({
    strengths: z.array(z.string().trim().min(1).max(200)).min(1, "가장 좋았던 점을 입력해 주세요.").max(3),
    weaknesses: z.array(z.string().trim().min(1).max(200)).min(1, "아쉬운 점 또는 특별히 없음을 입력해 주세요.").max(3),
    suitableFor: textList(14),
    unsuitableFor: textList(10),
    revisitIntent: z.string().trim().min(1, "재방문 의사를 선택해 주세요.").max(60),
    revisitReason: z.string().trim().max(300),
    oneLineReview: optionalText(150)
  })
});

export const generateReviewInputSchema = cafeReviewFormSchema.extend({
  photoCount: z.number().int().min(0).max(12)
});

export const editableReviewSchema = cafeReviewFormSchema
  .partial()
  .extend({
    selectedTitle: z.string().trim().min(1).max(100).optional(),
    summary: z.string().trim().min(1).max(150).optional(),
    body: z.string().trim().min(1).max(5000).optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).optional()
  });

export type CafeReviewForm = z.infer<typeof cafeReviewFormSchema>;
export type GenerateReviewInput = z.infer<typeof generateReviewInputSchema>;

export function normalizeTags(tags: string[]) {
  const seen = new Set<string>();
  return tags
    .map((tag) => tag.replace(/^#+/, "").trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}
