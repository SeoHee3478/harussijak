import { useState } from "react";
import { Link } from "react-router-dom";
import { getTreeColor } from "@/lib/categories";
import { isToday } from "@/lib/dates";
import { isScheduledToday, formatDays } from "@/lib/weekdays";
import { useForest } from "@/store/forest-context";
import WaterDrop from "./WaterDrop";

// 오늘의 물주기 목록. 반복형 가지(=루틴) 중 "오늘 요일"에 해당하는 것만 나옴.
// 단발성 가지 완료는 나무 상세에서 처리.
export default function TodayList() {
  const { forest, waterRoutine } = useForest();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  function toggle(treeId: string) {
    setCollapsed((prev) => ({ ...prev, [treeId]: !prev[treeId] }));
  }

  const items = forest.trees
    .map((tree) => ({
      tree,
      routines: tree.branches.flatMap((b) =>
        b.routines
          .filter((r) => isScheduledToday(r.days))
          .map((r) => ({
            ...r,
            branchId: b.id,
            wateredToday: isToday(r.lastWateredAt),
          }))
      ),
    }))
    .filter((it) => it.routines.length > 0);

  if (items.length === 0) {
    return (
      <p
        className="rounded-[var(--radius)] border border-dashed px-4 py-8 text-center text-sm leading-relaxed text-[var(--muted)]"
        style={{ borderColor: "var(--border)" }}
      >
        오늘 물 줄 루틴이 없어요.
        <br />
        나무를 눌러 세부목표를 더해보세요.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {items.map(({ tree, routines }) => {
        const category = getTreeColor(tree);
        const doneCount = routines.filter((r) => r.wateredToday).length;
        const allDone = doneCount === routines.length;
        const isCollapsed = collapsed[tree.id] ?? false;

        return (
          <div
            key={tree.id}
            className="overflow-hidden rounded-[var(--radius)]"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <div className="flex items-stretch">
              <Link
                to={`/tree/${tree.id}`}
                className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-4"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: category.color }}
                  aria-hidden
                />
                <span className="truncate text-base font-medium">
                  {tree.name}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => toggle(tree.id)}
                className="flex w-12 shrink-0 items-center justify-center text-base text-[var(--muted)]"
                aria-label={isCollapsed ? "펼치기" : "접기"}
              >
                <span aria-hidden>{isCollapsed ? "▸" : "▾"}</span>
              </button>
            </div>

            {!isCollapsed && (
              <div>
                {routines.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() =>
                      waterRoutine(tree.id, r.branchId, r.id, r.wateredToday)
                    }
                    className="flex w-full items-center gap-3 border-t px-4 py-3.5 text-left"
                    style={{ borderColor: "var(--border-soft)" }}
                  >
                    <WaterDrop
                      filled={r.wateredToday}
                      color={category.color}
                      size={26}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className="block text-base"
                        style={
                          r.wateredToday ? { color: "var(--muted)" } : undefined
                        }
                      >
                        {r.name}
                      </span>
                      <span className="block text-sm text-[var(--muted)]">
                        {formatDays(r.days)} · 누적 {r.waterCount}회
                      </span>
                    </span>
                  </button>
                ))}
                <p
                  className="border-t px-4 py-3 text-sm text-[var(--muted)]"
                  style={{ borderColor: "var(--border-soft)" }}
                >
                  {doneCount === 0
                    ? "오늘은 아직이에요"
                    : allDone
                      ? "오늘 몫은 다 줬어요"
                      : `오늘 ${doneCount}곳에 물을 줬어요`}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
