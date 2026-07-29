import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 text-center">
      <h1 className="text-xl font-bold">존재하지 않는 페이지예요.</h1>
      <Link className="mt-4 rounded-md bg-emerald-700 px-4 py-3 text-white" href="/">새 리뷰로 이동</Link>
    </main>
  );
}
