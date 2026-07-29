import { describe, expect, it } from "vitest";
import { CafeReviewResultSchema, validatePhotoPlan } from "@/lib/ai/schema";
import { formatFullCopy, formatTags, insertPhotoMarkers } from "@/lib/clipboard/format-review";
import { generateReviewInputSchema, normalizeTags } from "@/lib/validation";

function validInput() {
  return {
    cafeType: ["space", "coffee"],
    basic: {
      cafeName: "카페 아만토",
      area: "오사카 나카자키초",
      visitedAt: "2026-07-27",
      visitTime: "afternoon",
      companion: "alone",
      visitReason: "여행 중 쉬기 위해 방문"
    },
    access: {},
    exterior: { styles: [] },
    space: { zones: [], seatTypes: [] },
    atmosphere: { keywords: ["차분함"], standoutElement: "건물 사이의 작은 정원" },
    menuOverview: { categories: ["커피 중심"] },
    orderedItems: [{ name: "아이스 커피", price: "500엔", flavorTraits: ["깔끔함"], note: "맛은 무난했고 끝맛이 깔끔했다." }],
    usability: { restroom: [], accessibilityOptions: {}, amenities: [] },
    service: {},
    photo: { recommendedSubjects: [] },
    conclusion: {
      strengths: ["정원이 편안함"],
      weaknesses: ["의자가 오래 앉기 불편함"],
      suitableFor: ["혼자 방문"],
      unsuitableFor: [],
      revisitIntent: "근처에 오면 재방문",
      revisitReason: "공간 때문에 다시 들르고 싶음"
    },
    photoCount: 2
  };
}

describe("review validation", () => {
  it("accepts the minimum structured generation input", () => {
    expect(generateReviewInputSchema.safeParse(validInput()).success).toBe(true);
  });

  it("rejects missing atmosphere keywords", () => {
    const input = validInput();
    input.atmosphere.keywords = [];
    expect(generateReviewInputSchema.safeParse(input).success).toBe(false);
  });

  it("requires a menu evaluation", () => {
    const input = validInput();
    input.orderedItems[0].note = "";
    expect(generateReviewInputSchema.safeParse(input).success).toBe(false);
  });

  it("accepts 특별히 없음 as a weakness", () => {
    const input = validInput();
    input.conclusion.weaknesses = ["특별히 없음"];
    expect(generateReviewInputSchema.safeParse(input).success).toBe(true);
  });
});

describe("AI output validation", () => {
  const valid = {
    titleOptions: ["정원이 편했던 카페", "다시 들르고 싶은 공간", "무난한 커피와 좋은 시간"],
    summary: "정원이 편했고 커피는 무난했던 방문 기록.",
    body: "정원이 편해서 잠시 쉬기 좋았다. 커피는 특별히 강한 인상은 아니었지만 무난했다. 창가 쪽 분위기는 차분했고, 오래 머무는 사람도 부담스럽지 않아 보였다.\n\n의자는 오래 앉으면 조금 불편했지만 공간이 주는 느낌 때문에 근처라면 다시 들를 것 같다. 과하게 추천하기보다는 조용히 기록해 두고 싶은 방문이었다.",
    tags: ["나카자키초카페", "오사카카페"],
    photoPlan: [{ sourceIndex: 1, recommendedOrder: 1, category: "exterior", description: "카페 입구", insertAfterParagraph: 0, optionalCaption: null }],
    warnings: []
  };

  it("accepts valid structured output", () => {
    expect(CafeReviewResultSchema.parse(valid).titleOptions).toHaveLength(3);
  });

  it("rejects invalid photo indexes", () => {
    expect(() => validatePhotoPlan(CafeReviewResultSchema.parse(valid), 0)).toThrow();
  });
});

describe("copy formatting", () => {
  it("normalizes tags", () => {
    expect(normalizeTags(["#오사카", "오사카", " 커피 "])).toEqual(["오사카", "커피"]);
    expect(formatTags(["오사카", "커피"])).toBe("#오사카 #커피");
  });

  it("inserts photo markers after paragraphs", () => {
    const output = insertPhotoMarkers("첫 문단\n\n둘째 문단", [
      { sourceIndex: 2, recommendedOrder: 1, category: "drink", description: "커피", insertAfterParagraph: 1, optionalCaption: null }
    ]);
    expect(output).toContain("[사진 2 · 음료]");
  });

  it("formats full copy text", () => {
    expect(formatFullCopy("제목", "본문", ["태그"])).toBe("제목\n\n본문\n\n#태그");
  });
});
