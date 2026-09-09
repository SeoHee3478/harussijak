import { useNavigate } from "react-router-dom";
import MonthCalendar from "@/components/MonthCalendar";
import TreeTimeline from "@/components/TreeTimeline";
import { useAuth } from "@/store/auth-context";

// 기록 화면 - 여태까지 물 준 흔적. 스트릭·실패 표시 없이 잔잔하게.
export default function RecordPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <main className="mx-auto max-w-[400px] px-4 pb-16 pt-6">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-4 flex items-center gap-1.5 text-sm text-[var(--muted)]"
      >
        <span aria-hidden>←</span> 숲으로
      </button>

      <h1 className="mb-5 text-2xl font-semibold">기록</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold">달마다</h2>
        <MonthCalendar />
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold">나무별 발자취</h2>
        <TreeTimeline />
      </section>

      <button
        type="button"
        onClick={() => signOut()}
        className="w-full py-2 text-center text-sm text-[var(--muted)] underline"
      >
        로그아웃
      </button>
    </main>
  );
}
