"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { prepareImage } from "@/lib/images/client-convert";
import type { PreparedImage } from "@/lib/images/types";
import { cafeReviewFormSchema, type CafeReviewForm } from "@/lib/validation";

const DRAFT_KEY = "cafe-note-structured-draft-v2";

type Option = readonly [string, string];

const OPTIONS = {
  cafeType: [
    ["space", "공간·인테리어형"],
    ["coffee", "커피 전문형"],
    ["bakery", "베이커리·디저트형"],
    ["work", "작업하기 좋은 카페"],
    ["large", "대형·근교형"],
    ["brunch", "브런치형"],
    ["view", "뷰·야외형"],
    ["concept", "특별한 콘셉트형"],
    ["neighborhood", "동네 카페"],
    ["other", "기타"]
  ],
  visitTime: [["morning", "오전"], ["lunch", "점심"], ["afternoon", "오후"], ["evening", "저녁"], ["night", "밤"]],
  companion: [["alone", "혼자"], ["friend", "친구"], ["partner", "연인"], ["family", "가족"], ["coworker", "동료"], ["other", "기타"]],
  transport: ["도보", "대중교통", "자동차", "자전거", "기타"],
  accessibility: ["매우 쉬움", "쉬움", "조금 어려움", "찾기 어려움"],
  parking: ["전용 주차장 있음", "건물 주차장 이용", "인근 공영주차장", "주차 어려움", "확인하지 못함", "해당 없음"],
  waiting: ["없음", "잠깐 기다림", "10~20분", "20분 이상", "자리는 있었지만 주문 대기", "확인하지 못함"],
  exterior: ["오래된 건물", "현대적", "한옥", "주택 개조", "산업적", "자연친화적", "화려함", "소박함", "독특한 구조", "평범함", "기타"],
  overallSize: ["매우 작음", "작은 편", "중간", "큰 편", "매우 큼"],
  estimatedSeats: ["10석 미만", "10~20석", "20~40석", "40~80석", "80석 이상", "세어보지 못함"],
  zones: ["단일 공간", "여러 개의 방", "복층", "2층 이상", "야외 정원", "테라스", "루프톱", "별관", "단체 공간", "바 좌석", "좌식 공간"],
  seatTypes: ["2인 테이블", "4인 테이블", "대형 공용 테이블", "소파", "바 좌석", "창가 좌석", "야외 좌석", "낮은 테이블", "스탠딩 좌석"],
  seatSpacing: ["넓음", "적당함", "가까움", "매우 좁음", "좌석마다 다름"],
  chairComfort: ["편함", "보통", "오래 앉기 불편", "매우 불편", "좌석마다 다름"],
  tableSize: ["노트북과 음료를 놓기 충분", "음료와 디저트를 놓기 충분", "작은 편", "매우 작음", "좌석마다 다름"],
  crowdLevel: ["매우 한산", "한산", "보통", "붐빔", "매우 붐빔", "만석"],
  seatAvailability: ["원하는 자리를 고를 수 있었음", "자리는 있었지만 선택지는 적었음", "빈자리를 겨우 찾음", "대기 후 착석", "테이크아웃해서 확인하지 못함"],
  atmosphere: ["조용함", "차분함", "따뜻함", "밝음", "어두움", "활기참", "자유로움", "세련됨", "빈티지", "미니멀", "아늑함", "웅장함", "자연친화적", "이국적", "독특함", "상업적", "편안함", "사진 찍기 좋음"],
  daylight: ["자연광이 매우 좋음", "자연광이 좋은 편", "보통", "조금 어두움", "매우 어두움", "방문 시간상 판단 어려움"],
  viewType: ["거리", "골목", "정원", "산", "강·바다", "도심", "건물", "특별한 뷰 없음", "기타"],
  music: ["거의 들리지 않음", "잔잔함", "적당함", "큰 편", "매우 큼", "음악 선곡이 인상적", "확인하지 못함"],
  noise: ["매우 조용", "조용", "적당", "시끄러움", "매우 시끄러움"],
  menuCategories: ["커피 중심", "논커피 다양", "차 종류 다양", "베이커리 다양", "디저트 중심", "브런치 있음", "식사 메뉴 있음", "주류 있음", "메뉴가 적고 집중되어 있음", "메뉴가 매우 많음"],
  priceImpression: ["저렴함", "무난함", "조금 비쌈", "비쌈", "공간을 고려하면 납득 가능", "양이나 맛을 고려하면 비싼 편"],
  orderingMethod: ["직원에게 주문", "키오스크", "테이블 주문", "QR 주문", "선결제", "후결제", "기타"],
  itemType: ["에스프레소", "아메리카노", "라떼", "필터커피", "시그니처 음료", "차", "에이드", "케이크", "구움과자", "빵", "브런치", "식사", "기타"],
  flavorTraits: ["달콤함", "산미", "쌉싸름함", "고소함", "진함", "깔끔함", "묵직함", "부드러움", "상큼함", "담백함", "짭짤함", "풍미가 약함", "인공적인 맛", "균형이 좋음"],
  texture: ["바삭함", "촉촉함", "부드러움", "쫀득함", "꾸덕함", "가벼움", "거침", "해당 없음"],
  portion: ["적음", "적당함", "많음", "나눠 먹기 좋음"],
  appearance: ["사진보다 좋음", "사진과 비슷함", "평범함", "다소 아쉬움", "예쁘지만 먹기 불편함"],
  value: ["매우 만족", "만족", "보통", "아쉬움", "매우 아쉬움"],
  reorderIntent: ["다시 주문", "다른 메뉴를 먹어볼 예정", "고민", "다시 주문하지 않음"],
  stayDuration: ["30분 미만", "30분~1시간", "1~2시간", "2시간 이상"],
  outlets: ["많음", "일부 좌석에 있음", "거의 없음", "없음", "확인하지 못함"],
  wifi: ["있음", "없음", "확인하지 못함"],
  laptopSuitability: ["매우 적합", "적합", "짧게 가능", "부적합", "확인하지 못함"],
  restroom: ["매장 내부", "건물 공용", "외부", "깨끗함", "보통", "아쉬움", "확인하지 못함"],
  amenities: ["물 셀프", "담요", "짐 보관 바구니", "책 또는 잡지", "포장 가능", "디카페인", "식물성 우유", "별도 대기 공간", "기타"],
  staffResponse: ["매우 친절", "친절", "보통", "다소 무뚝뚝", "불친절", "거의 접촉 없음"],
  menuExplanation: ["자세함", "필요한 정도", "별도 설명 없음", "설명이 부족함"],
  servingSpeed: ["매우 빠름", "빠름", "보통", "조금 오래 걸림", "매우 오래 걸림"],
  photoDifficulty: ["어디서 찍어도 잘 나옴", "특정 자리만 좋음", "사람이 많아 찍기 어려움", "조명이 어두워 어려움", "특별히 사진 목적의 공간은 아님"],
  photoSubjects: ["외관", "입구", "전체 공간", "좌석", "창가", "정원", "메뉴판", "주문한 음료", "디저트", "시그니처 공간", "소품", "뷰"],
  suitableFor: ["혼자 방문", "데이트", "친구와 대화", "가족", "아이 동반", "반려동물 동반", "노트북 작업", "독서", "사진 촬영", "커피를 중요하게 보는 사람", "디저트를 좋아하는 사람", "조용한 공간을 원하는 사람", "대형 공간을 원하는 사람", "여행 중 잠시 쉬려는 사람"],
  unsuitableFor: ["조용한 곳을 원하는 사람", "저렴한 가격을 원하는 사람", "오래 작업하려는 사람", "주차가 꼭 필요한 사람", "편한 좌석을 원하는 사람", "웨이팅을 싫어하는 사람", "커피 맛을 최우선으로 보는 사람", "사진 촬영에 관심 없는 사람", "특별히 없음"],
  revisitIntent: ["꼭 다시 방문", "근처에 오면 재방문", "다른 메뉴를 위해 한 번 더 방문", "고민", "재방문하지 않을 것"]
} as const;

const specialConditions = ["반려동물", "유아 동반", "유아용 의자", "휠체어·유모차", "단체 방문", "예약", "야외 좌석", "흡연 공간"];
const conditionValues = ["가능", "불가능", "일부 가능", "확인 못함"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultForm(): CafeReviewForm {
  return {
    cafeType: [],
    basic: { cafeName: "", area: "", visitedAt: today(), visitTime: "afternoon", companion: "alone", visitReason: "" },
    access: {},
    exterior: { styles: [] },
    space: { zones: [], seatTypes: [] },
    atmosphere: { keywords: [], standoutElement: "" },
    menuOverview: { categories: [] },
    orderedItems: [{ name: "", price: "", flavorTraits: [], note: "" }],
    usability: { restroom: [], accessibilityOptions: {}, amenities: [] },
    service: {},
    photo: { recommendedSubjects: [] },
    conclusion: { strengths: [""], weaknesses: [""], suitableFor: [], unsuitableFor: [], revisitIntent: "", revisitReason: "" }
  };
}

function asOptions(values: readonly string[]): readonly Option[] {
  return values.map((value) => [value, value] as const);
}

function toggle(values: string[], value: string, max = Number.POSITIVE_INFINITY) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value].slice(0, max);
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
  multiple = false,
  max
}: {
  label: string;
  options: readonly Option[];
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  max?: number;
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map(([optionValue, optionLabel]) => {
          const active = selected.includes(optionValue);
          return (
            <button
              key={optionValue}
              type="button"
              aria-pressed={active}
              className={`tap rounded-md px-3 py-2 text-sm ring-1 transition ${
                active ? "bg-emerald-700 text-white ring-emerald-700" : "bg-white text-slate-700 ring-slate-200"
              }`}
              onClick={() => onChange(multiple ? toggle(selected, optionValue, max) : optionValue)}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  multiline = false,
  maxLength = 300
}: {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  maxLength?: number;
}) {
  const className = "mt-1 w-full rounded-md border-slate-300 bg-white";
  return (
    <label className="block text-sm font-semibold text-slate-800">
      {label}{required && <span className="ml-1 text-red-600">*</span>}
      {multiline ? (
        <textarea className={`${className} min-h-24`} value={value ?? ""} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={className} type={type} value={value ?? ""} maxLength={type === "number" ? undefined : maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function SectionCard({
  title,
  status,
  open,
  onToggle,
  children
}: {
  title: string;
  status: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <button type="button" className="tap flex w-full items-center justify-between gap-3 px-4 py-3 text-left" onClick={onToggle} aria-expanded={open}>
        <span className="font-semibold text-slate-950">{title}</span>
        <span className="flex items-center gap-2 text-xs text-slate-500"><span>{status}</span><span aria-hidden>{open ? "−" : "+"}</span></span>
      </button>
      {open && <div className="space-y-5 border-t border-slate-100 px-4 py-5">{children}</div>}
    </section>
  );
}

function ListEditor({
  label,
  values,
  onChange,
  placeholder,
  required,
  max = 3,
  allowNoIssue = false
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  required?: boolean;
  max?: number;
  allowNoIssue?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">{label}{required && <span className="ml-1 text-red-600">*</span>}</legend>
      {values.map((value, index) => (
        <div className="flex gap-2" key={index}>
          <input className="min-w-0 flex-1 rounded-md border-slate-300" value={value} maxLength={200} placeholder={placeholder} onChange={(event) => onChange(values.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} />
          {values.length > 1 && <Button variant="ghost" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>삭제</Button>}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" disabled={values.length >= max} onClick={() => onChange([...values, ""])}>항목 추가</Button>
        {allowNoIssue && <Button variant="secondary" onClick={() => onChange(["특별히 없음"])}>특별히 없음</Button>}
      </div>
    </fieldset>
  );
}

export function ReviewForm() {
  const router = useRouter();
  const [form, setForm] = useState<CafeReviewForm>(createDefaultForm);
  const [openSection, setOpenSection] = useState(0);
  const [images, setImages] = useState<PreparedImage[]>([]);
  const [toast, setToast] = useState("");
  const [restored, setRestored] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as CafeReviewForm;
      setForm({ ...createDefaultForm(), ...parsed });
      setRestored(true);
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify(form)), 400);
    return () => window.clearTimeout(handle);
  }, [form]);

  const hasType = (type: string) => form.cafeType.includes(type as CafeReviewForm["cafeType"][number]);
  const showWork = hasType("work");
  const showLarge = hasType("large");
  const showCoffeeDetails = hasType("coffee") || hasType("bakery");
  const canGenerate = cafeReviewFormSchema.safeParse(form).success && !loading;
  const totalSizeMb = useMemo(
    () => images.reduce((sum, image) => sum + (image.status === "ready" ? image.file.size : 0), 0) / 1024 / 1024,
    [images]
  );

  function patch<K extends Exclude<keyof CafeReviewForm, "cafeType" | "orderedItems">>(section: K, values: Partial<CafeReviewForm[K]>) {
    setForm((previous) => ({ ...previous, [section]: { ...previous[section], ...values } }));
  }

  function patchItem(index: number, values: Partial<CafeReviewForm["orderedItems"][number]>) {
    setForm((previous) => ({
      ...previous,
      orderedItems: previous.orderedItems.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item)
    }));
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    setStep("사진을 정리하고 있어요");
    const selected = [...files].slice(0, Math.max(0, 12 - images.length));
    const prepared = await Promise.all(selected.map((file, index) => prepareImage(file, images.length + index + 1)));
    setImages((previous) => [...previous, ...prepared].slice(0, 12));
    setStep("");
  }

  async function generate() {
    const parsed = cafeReviewFormSchema.safeParse(form);
    if (!parsed.success) {
      setToast(parsed.error.issues[0]?.message ?? "필수 입력을 확인해 주세요.");
      return;
    }

    setLoading(true);
    setStep("방문 정보를 읽고 있어요");
    const body = new FormData();
    body.set("payload", JSON.stringify(parsed.data));
    images.filter((image) => image.status === "ready").forEach((image) => body.append("images", image.file));
    const timer = window.setTimeout(() => setStep("리뷰 초안을 만들고 있어요"), 900);
    const response = await fetch("/api/reviews/generate", { method: "POST", body }).catch(() => null);
    window.clearTimeout(timer);
    setLoading(false);
    setStep("");

    if (!response?.ok) {
      const data = await response?.json().catch(() => null);
      setToast(data?.error?.message ?? "네트워크 연결을 확인해 주세요.");
      return;
    }
    const data = await response.json();
    localStorage.removeItem(DRAFT_KEY);
    router.push(`/review/${data.review.id}`);
  }

  function resetDraft() {
    images.forEach((image) => {
      if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
    });
    localStorage.removeItem(DRAFT_KEY);
    setForm(createDefaultForm());
    setImages([]);
    setRestored(false);
    setOpenSection(0);
    setToast("새 입력을 시작했어요");
  }

  const statuses = [
    form.basic.cafeName && form.basic.area && form.basic.visitReason ? "완료" : "필수 입력",
    [form.access.transport, form.access.waiting, form.exterior.firstImpression].filter(Boolean).length ? "입력됨" : "선택 사항",
    `${[form.space.overallSize, form.space.seatSpacing, form.space.crowdLevel, ...form.space.zones, ...form.space.seatTypes].filter(Boolean).length}개 항목`,
    form.atmosphere.keywords.length && form.atmosphere.standoutElement ? "완료" : "필수 입력",
    `메뉴 ${form.orderedItems.filter((item) => item.name).length}개`,
    [form.usability.stayDuration, form.service.staffResponse, ...form.usability.amenities].filter(Boolean).length ? "입력됨" : "선택 사항",
    images.length ? `사진 ${images.length}장` : "선택 사항",
    form.conclusion.strengths.some(Boolean) && form.conclusion.weaknesses.some(Boolean) && form.conclusion.revisitIntent ? "완료" : "필수 입력"
  ];

  return (
    <div className="space-y-5 pb-32">
      <Toast message={toast} />
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-950">새 리뷰</h1>
          <Button variant="ghost" onClick={resetDraft}>새로 작성</Button>
        </div>
        <p className="text-sm text-slate-600">선택 항목 위주로 3~5분 안에 방문 경험을 정리해 보세요.</p>
        {restored && <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">작성 중이던 내용을 복구했어요.</div>}
      </header>

      <section className="space-y-3">
        <ChipGroup label="카페 유형 (복수 선택)" options={OPTIONS.cafeType} value={form.cafeType} multiple onChange={(value) => setForm((previous) => ({ ...previous, cafeType: value as CafeReviewForm["cafeType"] }))} />
      </section>

      <div className="space-y-3">
        <SectionCard title="1. 기본정보" status={statuses[0]} open={openSection === 0} onToggle={() => setOpenSection(openSection === 0 ? -1 : 0)}>
          <TextField label="카페명" required value={form.basic.cafeName} onChange={(value) => patch("basic", { cafeName: value })} />
          <TextField label="지역 또는 지점명" required value={form.basic.area} placeholder="성수동, 오사카 나카자키초" onChange={(value) => patch("basic", { area: value })} />
          <TextField label="방문 날짜" required type="date" value={form.basic.visitedAt} onChange={(value) => patch("basic", { visitedAt: value })} />
          <ChipGroup label="방문 시간대 *" options={OPTIONS.visitTime} value={form.basic.visitTime} onChange={(value) => patch("basic", { visitTime: value as CafeReviewForm["basic"]["visitTime"] })} />
          <ChipGroup label="함께 방문한 사람" options={OPTIONS.companion} value={form.basic.companion} onChange={(value) => patch("basic", { companion: value as CafeReviewForm["basic"]["companion"] })} />
          <TextField label="방문하게 된 이유" required value={form.basic.visitReason} placeholder="근처를 걷다가 우연히 발견" onChange={(value) => patch("basic", { visitReason: value })} />
        </SectionCard>

        <SectionCard title="2. 접근·방문 상황" status={statuses[1]} open={openSection === 1} onToggle={() => setOpenSection(openSection === 1 ? -1 : 1)}>
          <ChipGroup label="접근 방식" options={asOptions(OPTIONS.transport)} value={form.access.transport} onChange={(value) => patch("access", { transport: value as string })} />
          <ChipGroup label="찾아가기 쉬웠는지" options={asOptions(OPTIONS.accessibility)} value={form.access.accessibility} onChange={(value) => patch("access", { accessibility: value as string })} />
          <TextField label="입구 또는 위치 관련 메모" value={form.access.entranceNote} placeholder="건물 3층에 있어 입구를 찾기 어려웠음" onChange={(value) => patch("access", { entranceNote: value })} />
          {(showLarge || form.access.parking) && <>
            <ChipGroup label="주차" options={asOptions(OPTIONS.parking)} value={form.access.parking} onChange={(value) => patch("access", { parking: value as string })} />
            <TextField label="주차 상세" value={form.access.parkingNote} placeholder="주말에는 주차 대기가 있었음" onChange={(value) => patch("access", { parkingNote: value })} />
          </>}
          <ChipGroup label="웨이팅" options={asOptions(OPTIONS.waiting)} value={form.access.waiting} onChange={(value) => patch("access", { waiting: value as string })} />
          <ChipGroup label="외관 스타일" options={asOptions(OPTIONS.exterior)} value={form.exterior.styles} multiple onChange={(value) => patch("exterior", { styles: value as string[] })} />
          <TextField label="들어갔을 때 첫인상" value={form.exterior.firstImpression} placeholder="사진보다 공간이 훨씬 넓게 느껴졌다" onChange={(value) => patch("exterior", { firstImpression: value })} />
        </SectionCard>

        <SectionCard title="3. 공간·좌석" status={statuses[2]} open={openSection === 2} onToggle={() => setOpenSection(openSection === 2 ? -1 : 2)}>
          <ChipGroup label="전체 규모" options={asOptions(OPTIONS.overallSize)} value={form.space.overallSize} onChange={(value) => patch("space", { overallSize: value as string })} />
          <ChipGroup label="대략적인 좌석 수" options={asOptions(OPTIONS.estimatedSeats)} value={form.space.estimatedSeats} onChange={(value) => patch("space", { estimatedSeats: value as string })} />
          <TextField label="정확한 좌석 수를 아는 경우" type="number" value={form.space.exactSeatCount} onChange={(value) => patch("space", { exactSeatCount: value ? Number(value) : undefined })} />
          <ChipGroup label="공간 구성" options={asOptions(OPTIONS.zones)} value={form.space.zones} multiple onChange={(value) => patch("space", { zones: value as string[] })} />
          <ChipGroup label="좌석 종류" options={asOptions(OPTIONS.seatTypes)} value={form.space.seatTypes} multiple onChange={(value) => patch("space", { seatTypes: value as string[] })} />
          <ChipGroup label="좌석 간격" options={asOptions(OPTIONS.seatSpacing)} value={form.space.seatSpacing} onChange={(value) => patch("space", { seatSpacing: value as string })} />
          <ChipGroup label="의자 편안함" options={asOptions(OPTIONS.chairComfort)} value={form.space.chairComfort} onChange={(value) => patch("space", { chairComfort: value as string })} />
          <ChipGroup label="테이블 크기" options={asOptions(OPTIONS.tableSize)} value={form.space.tableSize} onChange={(value) => patch("space", { tableSize: value as string })} />
          <ChipGroup label="방문 당시 혼잡도" options={asOptions(OPTIONS.crowdLevel)} value={form.space.crowdLevel} onChange={(value) => patch("space", { crowdLevel: value as string })} />
          <ChipGroup label="실제 자리 구하기" options={asOptions(OPTIONS.seatAvailability)} value={form.space.seatAvailability} onChange={(value) => patch("space", { seatAvailability: value as string })} />
          <TextField label="규모·좌석 메모" multiline value={form.space.spaceNote} placeholder="공간은 크지만 좌석을 많이 넣지 않아 쾌적했다" onChange={(value) => patch("space", { spaceNote: value })} />
        </SectionCard>

        <SectionCard title="4. 분위기" status={statuses[3]} open={openSection === 3} onToggle={() => setOpenSection(openSection === 3 ? -1 : 3)}>
          <ChipGroup label="분위기 키워드 (최대 5개) *" options={asOptions(OPTIONS.atmosphere)} value={form.atmosphere.keywords} multiple max={5} onChange={(value) => patch("atmosphere", { keywords: value as string[] })} />
          <TextField label="인테리어 재료 또는 색감" value={form.atmosphere.materialsAndColors} placeholder="원목 가구와 흰 벽" onChange={(value) => patch("atmosphere", { materialsAndColors: value })} />
          <ChipGroup label="채광" options={asOptions(OPTIONS.daylight)} value={form.atmosphere.daylight} onChange={(value) => patch("atmosphere", { daylight: value as string })} />
          <ChipGroup label="뷰" options={asOptions(OPTIONS.viewType)} value={form.atmosphere.viewType} onChange={(value) => patch("atmosphere", { viewType: value as string })} />
          {(hasType("view") || form.atmosphere.viewType) && <TextField label="뷰 상세" value={form.atmosphere.viewNote} placeholder="창가에서는 정원이 바로 보임" onChange={(value) => patch("atmosphere", { viewNote: value })} />}
          <ChipGroup label="음악" options={asOptions(OPTIONS.music)} value={form.atmosphere.music} onChange={(value) => patch("atmosphere", { music: value as string })} />
          <ChipGroup label="대화 소음" options={asOptions(OPTIONS.noise)} value={form.atmosphere.noise} onChange={(value) => patch("atmosphere", { noise: value as string })} />
          <TextField label="냄새와 온도" value={form.atmosphere.temperatureAndScent} placeholder="베이커리 냄새가 좋았다" onChange={(value) => patch("atmosphere", { temperatureAndScent: value })} />
          <TextField label="가장 인상적인 공간 요소" required value={form.atmosphere.standoutElement} placeholder="가운데 놓인 긴 공용 테이블" onChange={(value) => patch("atmosphere", { standoutElement: value })} />
        </SectionCard>

        <SectionCard title="5. 메뉴·주문" status={statuses[4]} open={openSection === 4} onToggle={() => setOpenSection(openSection === 4 ? -1 : 4)}>
          <ChipGroup label="메뉴 종류" options={asOptions(OPTIONS.menuCategories)} value={form.menuOverview.categories} multiple onChange={(value) => patch("menuOverview", { categories: value as string[] })} />
          <ChipGroup label="가격대 인상" options={asOptions(OPTIONS.priceImpression)} value={form.menuOverview.priceImpression} onChange={(value) => patch("menuOverview", { priceImpression: value as string })} />
          <ChipGroup label="주문 방식" options={asOptions(OPTIONS.orderingMethod)} value={form.menuOverview.orderingMethod} onChange={(value) => patch("menuOverview", { orderingMethod: value as string })} />
          <TextField label="주문 과정 메모" value={form.menuOverview.orderingNote} placeholder="메뉴 설명을 친절하게 해줌" onChange={(value) => patch("menuOverview", { orderingNote: value })} />

          <div className="space-y-4">
            {form.orderedItems.map((item, index) => (
              <div className="space-y-4 border-t border-slate-200 pt-4" key={index}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">주문 메뉴 {index + 1}</h3>
                  {form.orderedItems.length > 1 && <Button variant="ghost" onClick={() => setForm((previous) => ({ ...previous, orderedItems: previous.orderedItems.filter((_, itemIndex) => itemIndex !== index) }))}>삭제</Button>}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField label="메뉴명" required value={item.name} onChange={(value) => patchItem(index, { name: value })} />
                  <TextField label="가격" value={item.price} placeholder="7,000원" onChange={(value) => patchItem(index, { price: value })} />
                </div>
                <ChipGroup label="종류" options={asOptions(OPTIONS.itemType)} value={item.type} onChange={(value) => patchItem(index, { type: value as string })} />
                <TextField label="첫맛 또는 첫인상" value={item.firstImpression} placeholder="첫 모금부터 산미가 분명했다" onChange={(value) => patchItem(index, { firstImpression: value })} />
                <ChipGroup label="맛 특성" options={asOptions(OPTIONS.flavorTraits)} value={item.flavorTraits} multiple onChange={(value) => patchItem(index, { flavorTraits: value as string[] })} />
                {showCoffeeDetails && <>
                  <ChipGroup label="식감" options={asOptions(OPTIONS.texture)} value={item.texture} onChange={(value) => patchItem(index, { texture: value as string })} />
                  <ChipGroup label="비주얼" options={asOptions(OPTIONS.appearance)} value={item.appearance} onChange={(value) => patchItem(index, { appearance: value as string })} />
                </>}
                <ChipGroup label="양" options={asOptions(OPTIONS.portion)} value={item.portion} onChange={(value) => patchItem(index, { portion: value as string })} />
                <ChipGroup label="가격 대비 만족도" options={asOptions(OPTIONS.value)} value={item.value} onChange={(value) => patchItem(index, { value: value as string })} />
                <ChipGroup label="다시 주문할지" options={asOptions(OPTIONS.reorderIntent)} value={item.reorderIntent} onChange={(value) => patchItem(index, { reorderIntent: value as string })} />
                <TextField label="메뉴 자유 평가" required multiline value={item.note} placeholder="산미는 강하지만 끝맛이 깔끔해서 부담스럽지 않았다" onChange={(value) => patchItem(index, { note: value })} />
              </div>
            ))}
            <Button variant="secondary" disabled={form.orderedItems.length >= 8} onClick={() => setForm((previous) => ({ ...previous, orderedItems: [...previous.orderedItems, { name: "", price: "", flavorTraits: [], note: "" }] }))}>메뉴 추가</Button>
          </div>
        </SectionCard>

        <SectionCard title="6. 편의·서비스" status={statuses[5]} open={openSection === 5} onToggle={() => setOpenSection(openSection === 5 ? -1 : 5)}>
          <ChipGroup label="머문 시간" options={asOptions(OPTIONS.stayDuration)} value={form.usability.stayDuration} onChange={(value) => patch("usability", { stayDuration: value as string })} />
          {(showWork || form.usability.laptopSuitability) && <>
            <ChipGroup label="콘센트" options={asOptions(OPTIONS.outlets)} value={form.usability.outlets} onChange={(value) => patch("usability", { outlets: value as string })} />
            <ChipGroup label="와이파이" options={asOptions(OPTIONS.wifi)} value={form.usability.wifi} onChange={(value) => patch("usability", { wifi: value as string })} />
            <ChipGroup label="노트북 작업 적합성" options={asOptions(OPTIONS.laptopSuitability)} value={form.usability.laptopSuitability} onChange={(value) => patch("usability", { laptopSuitability: value as string })} />
            <TextField label="작업 관련 메모" value={form.usability.laptopNote} placeholder="창가 좌석에 콘센트가 있음" onChange={(value) => patch("usability", { laptopNote: value })} />
          </>}
          <ChipGroup label="화장실" options={asOptions(OPTIONS.restroom)} value={form.usability.restroom} multiple onChange={(value) => patch("usability", { restroom: value as string[] })} />
          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold">특별 이용 조건</legend>
            {specialConditions.map((condition) => (
              <label className="grid grid-cols-[1fr_9rem] items-center gap-3 text-sm" key={condition}>
                <span>{condition}</span>
                <select className="rounded-md border-slate-300" value={form.usability.accessibilityOptions[condition] ?? ""} onChange={(event) => patch("usability", { accessibilityOptions: { ...form.usability.accessibilityOptions, [condition]: event.target.value } })}>
                  <option value="">선택 안 함</option>
                  {conditionValues.map((value) => <option value={value} key={value}>{value}</option>)}
                </select>
              </label>
            ))}
          </fieldset>
          <ChipGroup label="기타 편의사항" options={asOptions(OPTIONS.amenities)} value={form.usability.amenities} multiple onChange={(value) => patch("usability", { amenities: value as string[] })} />
          <ChipGroup label="직원 응대" options={asOptions(OPTIONS.staffResponse)} value={form.service.staffResponse} onChange={(value) => patch("service", { staffResponse: value as string })} />
          <ChipGroup label="메뉴 설명" options={asOptions(OPTIONS.menuExplanation)} value={form.service.menuExplanation} onChange={(value) => patch("service", { menuExplanation: value as string })} />
          <ChipGroup label="음식이 나온 시간" options={asOptions(OPTIONS.servingSpeed)} value={form.service.servingSpeed} onChange={(value) => patch("service", { servingSpeed: value as string })} />
          <TextField label="서비스 관련 자유 메모" value={form.service.note} placeholder="바쁜 시간인데도 원두 차이를 자세히 설명해 줬다" onChange={(value) => patch("service", { note: value })} />
        </SectionCard>

        <SectionCard title="7. 사진 포인트" status={statuses[6]} open={openSection === 6} onToggle={() => setOpenSection(openSection === 6 ? -1 : 6)}>
          <TextField label="가장 사진이 잘 나오는 장소" value={form.photo.bestSpot} placeholder="2층 창가 좌석" onChange={(value) => patch("photo", { bestSpot: value })} />
          <ChipGroup label="사진 촬영 난이도" options={asOptions(OPTIONS.photoDifficulty)} value={form.photo.difficulty} onChange={(value) => patch("photo", { difficulty: value as string })} />
          <ChipGroup label="사진으로 남겨야 할 요소" options={asOptions(OPTIONS.photoSubjects)} value={form.photo.recommendedSubjects} multiple onChange={(value) => patch("photo", { recommendedSubjects: value as string[] })} />
          <TextField label="사진 관련 메모" value={form.photo.note} placeholder="오후에는 창가 쪽 역광이 강했다" onChange={(value) => patch("photo", { note: value })} />
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between"><h3 className="font-semibold">AI 분석 사진</h3><span className="text-xs text-slate-500">{images.length}/12 · {totalSizeMb.toFixed(1)}MB</span></div>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif" multiple onChange={(event) => onFiles(event.target.files)} className="block w-full text-sm" />
            <div className="grid grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-md bg-slate-200">
                  {image.previewUrl ? <Image unoptimized fill sizes="33vw" src={image.previewUrl} alt={`선택 사진 ${index + 1}`} className="object-cover" /> : <div className="p-2 text-xs text-red-700">{image.error}</div>}
                  <span className="absolute left-1 top-1 rounded bg-slate-950/80 px-2 py-1 text-xs text-white">{index + 1}</span>
                  <button type="button" className="absolute right-1 top-1 rounded bg-white px-2 py-1 text-xs" onClick={() => setImages((previous) => previous.filter((_, itemIndex) => itemIndex !== index))}>삭제</button>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="8. 총평" status={statuses[7]} open={openSection === 7} onToggle={() => setOpenSection(openSection === 7 ? -1 : 7)}>
          <ListEditor label="가장 좋았던 점" required values={form.conclusion.strengths} onChange={(values) => patch("conclusion", { strengths: values })} placeholder="정원이 보이는 창가 자리" />
          <ListEditor label="가장 아쉬웠던 점" required allowNoIssue values={form.conclusion.weaknesses} onChange={(values) => patch("conclusion", { weaknesses: values })} placeholder="의자가 오래 앉기 불편함" />
          <ChipGroup label="이 카페가 잘 맞는 사람" options={asOptions(OPTIONS.suitableFor)} value={form.conclusion.suitableFor} multiple onChange={(value) => patch("conclusion", { suitableFor: value as string[] })} />
          <ChipGroup label="이 카페가 안 맞을 수 있는 사람" options={asOptions(OPTIONS.unsuitableFor)} value={form.conclusion.unsuitableFor} multiple onChange={(value) => patch("conclusion", { unsuitableFor: value as string[] })} />
          <ChipGroup label="재방문 의사 *" options={asOptions(OPTIONS.revisitIntent)} value={form.conclusion.revisitIntent} onChange={(value) => patch("conclusion", { revisitIntent: value as string })} />
          <TextField label="재방문 이유" value={form.conclusion.revisitReason} placeholder="공간이 편해서 다른 계절에도 와보고 싶음" onChange={(value) => patch("conclusion", { revisitReason: value })} />
          <TextField label="한 줄 총평 (비워 두면 AI가 생성)" value={form.conclusion.oneLineReview} placeholder="커피보다 공간이 오래 기억에 남았던 카페" onChange={(value) => patch("conclusion", { oneLineReview: value })} />
        </SectionCard>
      </div>

      {!canGenerate && <p className="text-sm text-slate-600">필수 표시 항목과 메뉴 평가, 장점·아쉬운 점, 재방문 의사를 입력해 주세요.</p>}
      <div className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-3xl border-t border-slate-200 bg-white/95 px-4 pt-3 safe-bottom backdrop-blur">
        {step && <div className="mb-2 text-center text-sm text-slate-600">{step}</div>}
        <Button className="w-full" disabled={!canGenerate} onClick={generate}>{loading ? "생성 중" : "AI 리뷰 생성"}</Button>
      </div>
    </div>
  );
}
