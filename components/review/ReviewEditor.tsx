"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { formatFullCopy, formatTags, insertPhotoMarkers } from "@/lib/clipboard/format-review";
import type { CafeReviewResult } from "@/lib/ai/schema";
import type { CafeReviewForm } from "@/lib/validation";

export type ReviewEditorReview = CafeReviewForm & {
  id: string;
  cafeName: string;
  visitedAt: string;
  area: string;
  titleOptions: string[] | null;
  selectedTitle: string | null;
  summary: string | null;
  body: string | null;
  tags: string[] | null;
  photoPlan: CafeReviewResult["photoPlan"] | null;
  warnings: string[] | null;
};

const categoryLabels: Record<CafeReviewResult["photoPlan"][number]["category"], string> = {
  exterior: "외관",
  interior: "내부",
  menu: "메뉴",
  drink: "음료",
  food: "음식",
  detail: "디테일",
  other: "기타"
};

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const succeeded = document.execCommand("copy");
  textarea.remove();
  if (!succeeded) throw new Error("copy failed");
}

export function ReviewEditor({ initialReview }: { initialReview: ReviewEditorReview }) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [tagInput, setTagInput] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const handle = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(handle);
  }, [toast]);

  async function copy(label: string, text: string) {
    try {
      await copyText(text);
      setToast("복사했어요");
    } catch {
      setToast(`${label} 복사에 실패했어요. 길게 눌러 직접 복사해 주세요.`);
    }
  }

  async function save() {
    setSaving(true);
    const response = await fetch(`/api/reviews/${review.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selectedTitle: review.selectedTitle,
        summary: review.summary,
        body: review.body,
        tags: review.tags ?? []
      })
    });
    setSaving(false);
    setToast(response.ok ? "저장했어요" : "저장하지 못했어요.");
  }

  async function regenerate() {
    if (!window.confirm("저장된 입력값으로 텍스트 리뷰를 다시 생성할까요? 현재 수정한 생성 결과는 바뀝니다.")) return;
    setRegenerating(true);
    const response = await fetch(`/api/reviews/${review.id}/regenerate`, { method: "POST" });
    const data = await response.json().catch(() => null);
    setRegenerating(false);
    if (!response.ok) {
      setToast(data?.error?.message ?? "다시 생성하지 못했어요.");
      return;
    }
    setReview(data.review);
    setToast("텍스트로 다시 생성했어요");
  }

  async function remove() {
    if (!window.confirm("이 리뷰를 삭제할까요?")) return;
    const response = await fetch(`/api/reviews/${review.id}`, { method: "DELETE" });
    if (response.ok) router.replace("/history");
    else setToast("삭제하지 못했어요.");
  }

  const tags = review.tags ?? [];
  const body = review.body ?? "";
  const title = review.selectedTitle ?? review.titleOptions?.[0] ?? "";
  const photoBody = insertPhotoMarkers(body, review.photoPlan ?? []);

  return (
    <div className="space-y-6 pb-10">
      <Toast message={toast} />
      <header>
        <p className="text-sm text-slate-500">{review.visitedAt} · {review.area}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">{review.cafeName}</h1>
        <p className="mt-2 text-sm text-slate-600">{review.conclusion.revisitIntent}</p>
      </header>

      {!!review.warnings?.length && (
        <section className="space-y-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          {review.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-semibold">제목</h2>
        <div className="space-y-2">
          {(review.titleOptions ?? []).map((option) => (
            <button
              type="button"
              key={option}
              className={`tap w-full rounded-md px-3 py-2 text-left text-sm ${title === option ? "bg-emerald-700 text-white" : "bg-white ring-1 ring-slate-200"}`}
              onClick={() => setReview((previous) => ({ ...previous, selectedTitle: option }))}
            >
              {option}
            </button>
          ))}
        </div>
        <input className="w-full rounded-md border-slate-300" value={title} onChange={(event) => setReview((previous) => ({ ...previous, selectedTitle: event.target.value }))} />
        <Button variant="secondary" onClick={() => copy("제목", title)}>제목 복사</Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">한 줄 요약</h2>
        <input className="w-full rounded-md border-slate-300" value={review.summary ?? ""} onChange={(event) => setReview((previous) => ({ ...previous, summary: event.target.value }))} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">본문</h2>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => copy("본문", body)}>본문 복사</Button>
            <Button variant="secondary" onClick={() => copy("사진 표시 포함 본문", photoBody)}>사진 표시</Button>
          </div>
        </div>
        <textarea className="min-h-[420px] w-full rounded-md border-slate-300 leading-7" value={body} onChange={(event) => setReview((previous) => ({ ...previous, body: event.target.value }))} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">태그</h2>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button type="button" key={tag} className="tap rounded-md bg-slate-100 px-3 py-2 text-sm" onClick={() => setReview((previous) => ({ ...previous, tags: tags.filter((item) => item !== tag) }))}>
              #{tag} ×
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="min-w-0 flex-1 rounded-md border-slate-300" value={tagInput} onChange={(event) => setTagInput(event.target.value)} placeholder="태그 추가" />
          <Button
            variant="secondary"
            disabled={!tagInput.trim() || tags.length >= 10}
            onClick={() => {
              const normalized = tagInput.replace(/^#+/, "").trim();
              if (normalized && !tags.includes(normalized)) setReview((previous) => ({ ...previous, tags: [...tags, normalized].slice(0, 10) }));
              setTagInput("");
            }}
          >
            추가
          </Button>
        </div>
        <Button variant="secondary" onClick={() => copy("태그", formatTags(tags))}>태그 복사</Button>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">사진 추천 순서</h2>
        {(review.photoPlan ?? []).length === 0 ? (
          <p className="text-sm text-slate-500">저장된 사진 추천 순서가 없어요.</p>
        ) : (
          <div className="space-y-2">
            {[...(review.photoPlan ?? [])].sort((a, b) => a.recommendedOrder - b.recommendedOrder).map((photo) => (
              <div key={`${photo.sourceIndex}-${photo.recommendedOrder}`} className="rounded-md bg-white p-3 text-sm ring-1 ring-slate-200">
                <p className="font-semibold">추천 {photo.recommendedOrder}번 · 원본 사진 {photo.sourceIndex}</p>
                <p>분류: {categoryLabels[photo.category]}</p>
                <p>설명: {photo.description}</p>
                <p>위치: {photo.insertAfterParagraph === 0 ? "첫 문단 앞" : `${photo.insertAfterParagraph}번째 문단 뒤`}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-2 gap-2">
        <Button onClick={save} disabled={saving}>{saving ? "저장 중" : "저장"}</Button>
        <Button variant="secondary" onClick={() => copy("전체", formatFullCopy(title, body, tags))}>전체 복사</Button>
        <Button variant="secondary" disabled={regenerating} onClick={regenerate}>{regenerating ? "생성 중" : "다시 생성"}</Button>
        <Button variant="danger" onClick={remove}>삭제</Button>
      </section>
    </div>
  );
}
