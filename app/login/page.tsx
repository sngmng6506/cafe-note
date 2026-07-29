"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    }).catch(() => null);
    setLoading(false);
    if (!response?.ok) {
      const data = await response?.json().catch(() => null);
      setError(data?.error?.message ?? "로그인하지 못했어요.");
      return;
    }
    router.replace("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-slate-50 px-5 py-10">
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-950">Cafe Note</h1>
          <p className="mt-2 text-slate-600">개인 카페 리뷰 초안 작성 도구</p>
        </header>
        <form onSubmit={login} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold">비밀번호</span>
            <input type="password" className="mt-1 w-full rounded-md border-slate-300" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button className="w-full" disabled={loading || !password}>{loading ? "확인 중" : "로그인"}</Button>
        </form>
      </div>
    </main>
  );
}
