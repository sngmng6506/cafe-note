"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";

type ReviewListItem = {
  id: string;
  cafeName: string;
  visitedAt: string;
  area: string;
  selectedTitle: string | null;
  summary: string | null;
  conclusion: { revisitIntent?: string };
  updatedAt: string;
};

export default function HistoryPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ReviewListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      const params = new URLSearchParams({ page: String(page), limit: "30" });
      if (q.trim()) params.set("q", q.trim());
      const response = await fetch(`/api/reviews?${params}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data.items);
        setTotalPages(data.pagination.totalPages);
      }
    }, 200);
    return () => window.clearTimeout(handle);
  }, [q, page]);

  return (
    <AppShell>
      <div className="space-y-5 pb-10">
        <header>
          <h1 className="text-2xl font-bold text-slate-950">기록</h1>
          <input
            className="mt-4 w-full rounded-md border-slate-300"
            placeholder="카페명 검색"
            value={q}
            onChange={(event) => {
              setPage(1);
              setQ(event.target.value);
            }}
          />
        </header>
        {items.length === 0 ? (
          <p className="rounded-md bg-white p-5 text-center text-slate-500 ring-1 ring-slate-200">저장된 리뷰가 없어요.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link key={item.id} href={`/review/${item.id}`} className="block rounded-md bg-white p-4 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-950">{item.cafeName}</h2>
                    <p className="text-sm text-slate-500">{item.visitedAt} · {item.area}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{item.conclusion?.revisitIntent ?? "재방문 미평가"}</span>
                </div>
                {item.selectedTitle && <p className="mt-3 text-sm font-medium">{item.selectedTitle}</p>}
                {item.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summary}</p>}
                <p className="mt-3 text-xs text-slate-400">수정일 {new Date(item.updatedAt).toLocaleDateString("ko-KR")}</p>
              </Link>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button type="button" className="tap rounded-md bg-white px-4 text-sm ring-1 ring-slate-200" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>이전</button>
            <span className="text-sm text-slate-500">{page} / {totalPages}</span>
            <button type="button" className="tap rounded-md bg-white px-4 text-sm ring-1 ring-slate-200" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>다음</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
