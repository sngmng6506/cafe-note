import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ReviewEditor, type ReviewEditorReview } from "@/components/review/ReviewEditor";
import { prisma } from "@/lib/db";
import { serializeReview } from "@/lib/http";

async function getReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  return review ? (serializeReview(review) as unknown as ReviewEditorReview) : null;
}

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await getReview(id);
  if (!review) notFound();
  return (
    <AppShell>
      <ReviewEditor initialReview={review} />
    </AppShell>
  );
}
