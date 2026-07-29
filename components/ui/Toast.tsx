"use client";

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed left-4 right-4 top-[max(1rem,env(safe-area-inset-top))] z-50 rounded-md bg-slate-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
      {message}
    </div>
  );
}
