import type { CafeReviewResult } from "@/lib/ai/schema";
import { normalizeTags } from "@/lib/validation";

const categoryLabels: Record<string, string> = {
  exterior: "외관",
  interior: "내부",
  menu: "메뉴",
  drink: "음료",
  food: "음식",
  detail: "디테일",
  other: "기타"
};

export function formatTags(tags: string[]) {
  return normalizeTags(tags).map((tag) => `#${tag}`).join(" ");
}

export function insertPhotoMarkers(body: string, photoPlan: CafeReviewResult["photoPlan"]) {
  const paragraphs = body.split(/\n{2,}/);
  const markersByParagraph = new Map<number, string[]>();

  [...photoPlan]
    .sort((a, b) => a.recommendedOrder - b.recommendedOrder)
    .forEach((photo) => {
      const index = Math.min(photo.insertAfterParagraph, paragraphs.length);
      const marker = `[사진 ${photo.sourceIndex} · ${categoryLabels[photo.category] ?? "기타"}]`;
      markersByParagraph.set(index, [...(markersByParagraph.get(index) ?? []), marker]);
    });

  const output: string[] = [];
  const beforeFirst = markersByParagraph.get(0);
  if (beforeFirst) output.push(...beforeFirst);
  paragraphs.forEach((paragraph, index) => {
    output.push(paragraph);
    const markers = markersByParagraph.get(index + 1);
    if (markers) output.push(...markers);
  });
  return output.filter(Boolean).join("\n\n");
}

export function formatFullCopy(title: string, body: string, tags: string[]) {
  return [title.trim(), body.trim(), formatTags(tags)].filter(Boolean).join("\n\n");
}
