import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MonthCalendar from "@/components/MonthCalendar";
import TreeTimeline from "@/components/TreeTimeline";
import { useForest } from "@/store/forest-context";

// 기록 화면 - 여태까지 물 준 흔적. 스트릭·실패 표시 없이 잔잔하게.
export default function RecordPage() {
  const navigate = useNavigate();
  const { resetToSample } = useForest();
  const [confirmReset, setConfirmReset] = useState(false);

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

      {/* 프로토타입용 - 샘플(로그 포함) 다시 불러오기. 실제 배포 전 제거. */}
      {confirmReset ? (
        <div
          className="rounded-[var(--radius)] border px-3.5 py-3.5 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="mb-2.5 text-sm text-[var(--muted)]">
            지금 숲을 지우고 샘플 데이터로 되돌릴까요?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-[var(--radius)] border px-3 py-2.5 text-sm"
              style={{ borderColor: "var(--border)" }}
            >
              그대로 두기
            </button>
            <button
              type="button"
              onClick={() => {
                resetToSample();
                setConfirmReset(false);
              }}
              className="rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-white"
              style={{ background: "#b23c3c" }}
            >
              초기화
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="w-full py-2 text-center text-sm text-[var(--muted)] underline"
        >
          샘플 데이터로 초기화 (프로토타입용)
        </button>
      )}
    </main>
  );
}
