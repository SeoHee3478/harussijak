import { useState } from "react";
import { Link } from "react-router-dom";
import ForestGrid from "@/components/ForestGrid";
import TodayList from "@/components/TodayList";
import BottomSheet from "@/components/BottomSheet";
import { useForest } from "@/store/forest-context";

// 홈 - 상단: 내 숲(만다라트 그리드), 하단: 오늘의 물주기.
// 기존 /today, /forest 를 하나로 합침.
export default function HomePage() {
  const { forest, setTheme } = useForest();
  const [themeOpen, setThemeOpen] = useState(false);
  const [themeDraft, setThemeDraft] = useState("");

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  function openTheme() {
    setThemeDraft(forest.theme ?? "");
    setThemeOpen(true);
  }

  return (
    <main className="mx-auto max-w-[400px] px-4 pb-16 pt-7">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted)]">{today}</p>
          <h1 className="mt-0.5 text-[28px] font-semibold leading-tight">
            {forest.year} 숲
          </h1>
        </div>
        <Link
          to="/record"
          className="mt-1 shrink-0 rounded-full border px-3 py-1.5 text-sm text-[var(--muted)]"
          style={{ borderColor: "var(--border)" }}
        >
          기록
        </Link>
      </header>

      <section className="mb-9">
        <ForestGrid onCenterClick={openTheme} />
        <p className="mt-3 text-center text-sm leading-relaxed text-[var(--muted)]">
          빈 칸의 +를 눌러 나무를 심고
          <br />
          나무를 눌러 세부목표를 더해요
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">오늘의 물주기</h2>
        <TodayList />
      </section>

      <BottomSheet
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        title={`${forest.year} 숲의 한 줄`}
      >
        <input
          type="text"
          value={themeDraft}
          onChange={(e) => setThemeDraft(e.target.value)}
          placeholder="예: 성장의 해 (비워둬도 괜찮아요)"
          autoFocus
          className="mb-4 w-full rounded-[var(--radius)] border px-3.5 py-3 text-base"
          style={{ borderColor: "var(--border)" }}
        />
        <button
          type="button"
          onClick={() => {
            setTheme(themeDraft);
            setThemeOpen(false);
          }}
          className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white"
          style={{ background: "var(--foreground)" }}
        >
          저장
        </button>
      </BottomSheet>
    </main>
  );
}
