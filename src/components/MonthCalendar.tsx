import { useMemo, useState } from "react";
import { dateKey, isSameDay } from "@/lib/dates";
import { getSlotColor, getTreeColor } from "@/lib/categories";
import {
  activeDaysInMonth,
  countsFromEntries,
  dayEntries,
  leafShade,
  monthMatrix,
} from "@/lib/history";
import { useForest } from "@/store/forest-context";
import Leaf from "./Leaf";

const WEEK = ["일", "월", "화", "수", "목", "금", "토"];

// 월간 잎 캘린더. 물 준(또는 완료한) 날만 잎으로 채움. 안 준 날은 그냥 빈 칸.
// 상단 칩으로 나무를 골라 그 나무 기록만 볼 수 있음. 날짜를 누르면 그 날 한 일 목록.
export default function MonthCalendar() {
  const { forest } = useForest();
  const now = new Date();
  const [view, setView] = useState({
    year: now.getFullYear(),
    month0: now.getMonth(),
  });
  const [filterId, setFilterId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const entries = useMemo(
    () => dayEntries(forest, filterId ?? undefined),
    [forest, filterId]
  );
  const counts = useMemo(() => countsFromEntries(entries), [entries]);
  const weeks = useMemo(() => monthMatrix(view.year, view.month0), [view]);

  const filterTree = forest.trees.find((t) => t.id === filterId) ?? null;
  const leafColor = filterTree
    ? getTreeColor(filterTree).color
    : "var(--leaf)";

  const atCurrentMonth =
    view.year === now.getFullYear() && view.month0 === now.getMonth();

  function shift(delta: number) {
    setSelectedKey(null);
    setView((v) => {
      const d = new Date(v.year, v.month0 + delta, 1);
      return { year: d.getFullYear(), month0: d.getMonth() };
    });
  }

  const activeDays = activeDaysInMonth(counts, view.year, view.month0);
  const selectedEntries = selectedKey ? (entries.get(selectedKey) ?? []) : [];
  const selectedDate = selectedKey ? new Date(selectedKey + "T00:00:00") : null;

  return (
    <div
      className="rounded-[var(--radius-lg)] p-4"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {/* 나무 필터 - 목표가 많아질 수 있어 셀렉트로 */}
      <div className="relative mb-3">
        <select
          value={filterId ?? ""}
          onChange={(e) => {
            setFilterId(e.target.value || null);
            setSelectedKey(null);
          }}
          className="w-full appearance-none rounded-[var(--radius)] border bg-[var(--card)] px-3.5 py-2.5 pr-9 text-sm"
          style={{ borderColor: "var(--border)" }}
        >
          <option value="">전체 나무</option>
          {forest.trees.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]"
          aria-hidden
        >
          ▾
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          className="px-2 py-1 text-lg leading-none text-[var(--muted)]"
          aria-label="이전 달"
        >
          ‹
        </button>
        <span className="text-base font-semibold">
          {view.year}년 {view.month0 + 1}월
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={atCurrentMonth}
          className="px-2 py-1 text-lg leading-none text-[var(--muted)] disabled:opacity-30"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-xs text-[var(--muted)]">
        {WEEK.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1">
        {weeks.flat().map((day, i) => {
          if (!day) return <span key={i} />;
          const key = dateKey(day);
          const c = counts.get(key) ?? 0;
          const today = isSameDay(day, now);
          const selected = key === selectedKey;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedKey(selected ? null : key)}
              className="flex flex-col items-center gap-0.5 rounded-[10px] py-1"
              style={selected ? { background: "var(--card-sunken)" } : undefined}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-xs"
                style={
                  today
                    ? {
                        color: "var(--foreground)",
                        fontWeight: 600,
                        border: "1px solid var(--muted)",
                      }
                    : { color: "var(--muted)" }
                }
              >
                {day.getDate()}
              </span>
              {c > 0 ? (
                <Leaf opacity={leafShade(c)} size={15} color={leafColor} />
              ) : (
                <span className="h-[15px] w-[15px]" />
              )}
            </button>
          );
        })}
      </div>

      <p
        className="mt-3 border-t pt-3 text-sm text-[var(--muted)]"
        style={{ borderColor: "var(--border-soft)" }}
      >
        {activeDays > 0 ? (
          <>
            {view.month0 + 1}월에 {activeDays}일 물을 줬어요.
            <br />
            잎이 진할수록 그 날 여러 번 준 거예요.
          </>
        ) : (
          `${view.month0 + 1}월은 아직 조용해요.`
        )}
      </p>

      {selectedDate && (
        <div
          className="mt-3 border-t pt-3"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <p className="mb-2 text-sm font-semibold">
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일에 한 일
          </p>
          {selectedEntries.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">이 날은 조용했어요.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {selectedEntries.map((e, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: getSlotColor(e.treeColorKey ?? e.treeSlot)
                        .color,
                    }}
                    aria-hidden
                  />
                  <span>
                    {e.label}
                    {e.kind === "done" && " (완료)"}
                    <span className="ml-1.5 text-[var(--muted)]">
                      {e.treeName}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
