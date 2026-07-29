"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const INSTALL_DISMISSED_KEY = "cafe-note-install-dismissed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    setShowInstallGuide(!isStandalone && localStorage.getItem(INSTALL_DISMISSED_KEY) !== "true");
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  function dismissInstallGuide() {
    localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    setShowInstallGuide(false);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-slate-950">Cafe Note</Link>
          <Button variant="ghost" onClick={logout} className="px-2">로그아웃</Button>
        </div>
      </header>
      {showInstallGuide && (
        <aside className="mx-4 mt-4 flex items-start justify-between gap-3 rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
          <p>Safari 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택하면 앱처럼 사용할 수 있어요.</p>
          <button type="button" className="shrink-0 font-semibold" onClick={dismissInstallGuide} aria-label="설치 안내 닫기">×</button>
        </aside>
      )}
      <main className="flex-1 px-4 py-5">{children}</main>
      <nav className="sticky bottom-0 z-20 grid grid-cols-2 gap-2 border-t border-slate-200 bg-white/95 px-4 pt-2 safe-bottom backdrop-blur">
        <Link href="/" className={`tap rounded-md px-4 py-3 text-center text-sm font-semibold ${pathname === "/" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>새 리뷰</Link>
        <Link href="/history" className={`tap rounded-md px-4 py-3 text-center text-sm font-semibold ${pathname === "/history" ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-700"}`}>기록</Link>
      </nav>
    </div>
  );
}
