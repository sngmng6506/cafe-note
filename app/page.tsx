import { AppShell } from "@/components/layout/AppShell";
import { ReviewForm } from "@/components/review/ReviewForm";

export default function HomePage() {
  return (
    <AppShell>
      <div className="text-only-review">
        <ReviewForm />
      </div>
    </AppShell>
  );
}
