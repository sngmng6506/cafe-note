import { AppShell } from "@/components/layout/AppShell";
import { ReviewForm } from "@/components/review/ReviewForm";

export default function HomePage() {
  return (
    <AppShell>
      <ReviewForm />
    </AppShell>
  );
}
