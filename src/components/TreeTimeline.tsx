import { useMemo, useState } from "react";
import { dateKey, lastNDays } from "@/lib/dates";
import { getTreeColor } from "@/lib/categories";
import { leafShade, treeWaterCountsByDate } from "@/lib/history";
import { useForest } from "@/store/forest-context";

const WINDOW = 28; // 최근 4주

// 나무별 가로 타임라인. 오래된 날 → 오늘 순으로 흐름.
// 각 칸은 그 나무 색으로, 물 준 날만 채워짐.
export default function TreeTimeline() {
  const { forest } = useForest();
  const days = useMemo(() => lastNDays(WINDOW), []);
  const dayKeys = useMemo(() => days.map(dateKey), [days]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (forest.trees.length === 0) {
    return (
      <p
        className="rounded-[var(--radius)] border border-dashed px-4 py-8 text-center text-sm text-[var(--muted)]"
        style={{ borderColor: "var(--border)" }}
      >
        아직 심은 나무가 없어요.
      </p>
    );
  }

  const rows = forest.trees.map((tree) => {
    const counts = treeWaterCountsByDate(tree);
    const total = dayKeys.reduce((s, k) => s + (counts.get(k) ?? 0), 0);
    return { tree, counts, total };
  });

  const mostConsistent = rows.reduce((a, b) => (b.total > a.total ? b : a));

  return (
    <div
      className="rounded-[var(--radius-lg)] p-4"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      <div className="flex flex-col gap-3">
        {rows.map(({ tree, counts }) => {
          const color = getTreeColor(tree).color;
          const open = expanded.has(tree.id);
          return (
            <div key={tree.id} className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => toggle(tree.id)}
                className={`w-24 shrink-0 text-left text-sm font-medium ${
                  open ? "whitespace-normal break-keep" : "truncate"
                }`}
              >
                {tree.name}
              </button>
              <div className="flex flex-1 gap-[2px]">
                {dayKeys.map((k) => {
                  const shade = leafShade(counts.get(k) ?? 0);
                  return (
                    <span
                      key={k}
                      className="h-4 flex-1 rounded-[2px]"
                      style={{
                        background: shade > 0 ? color : "var(--card-sunken)",
                        opacity: shade > 0 ? shade : 1,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 양 끝 시점 표시 */}
      <div className="mt-1.5 flex items-center gap-2.5">
        <span className="w-24 shrink-0" />
        <div className="flex flex-1 justify-between text-xs text-[var(--muted)]">
          <span>4주 전</span>
          <span>오늘</span>
        </div>
      </div>

      {mostConsistent.total > 0 && (
        <p
          className="mt-3 border-t pt-3 text-sm text-[var(--muted)]"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <span className="font-medium text-[var(--foreground)]">
            {mostConsistent.tree.name}
          </span>
          에 가장 꾸준했어요.
        </p>
      )}
    </div>
  );
}
