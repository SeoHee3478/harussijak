import { Link } from "react-router-dom";
import { getTreeColor } from "@/lib/categories";
import { calculateTreeGrowth } from "@/lib/growth";
import { useForest } from "@/store/forest-context";
import GrowthIcon from "./GrowthIcon";

// 3x3 만다라트 그리드. 가운데(5번째 칸)는 연도/테마.
// 나머지 8칸(슬롯 1~8)에 나무. 빈 칸은 + (새 나무 심기 진입).
// 진행률은 성장 아이콘 4단계로만 표현 (단계 이름 글자는 안 씀 - 그리드가 깔끔하게).
const CENTER_INDEX = 4;

export default function ForestGrid({
  onCenterClick,
}: {
  onCenterClick?: () => void;
}) {
  const { forest } = useForest();
  const treesBySlot = Object.fromEntries(forest.trees.map((t) => [t.slot, t]));

  const cells: ("center" | number)[] = [];
  let slot = 1;
  for (let i = 0; i < 9; i++) {
    if (i === CENTER_INDEX) cells.push("center");
    else {
      cells.push(slot);
      slot++;
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cells.map((cell) => {
        if (cell === "center") {
          return (
            <button
              key="center"
              type="button"
              onClick={onCenterClick}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius)] p-1.5"
              style={{
                background: "var(--card-sunken)",
                border: "1px solid var(--border-soft)",
              }}
            >
              <span className="text-lg font-semibold">{forest.year}</span>
              <span className="line-clamp-2 px-1 text-xs leading-tight text-[var(--muted)]">
                {forest.theme ?? "테마 추가"}
              </span>
            </button>
          );
        }

        const slotNum = cell;
        const tree = treesBySlot[slotNum];

        if (!tree) {
          return (
            <Link
              key={slotNum}
              to={`/new-tree?slot=${slotNum}`}
              className="flex aspect-square items-center justify-center rounded-[var(--radius)] border border-dashed text-[var(--muted)] transition-colors hover:bg-[var(--card-sunken)]"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-2xl font-light">+</span>
            </Link>
          );
        }

        const growth = calculateTreeGrowth(
          tree.branches.map((b) => ({
            type: b.type,
            isCompleted: !!b.completedAt,
            waterCount: b.routines.reduce((s, r) => s + r.waterCount, 0),
          }))
        );

        return (
          <Link
            key={slotNum}
            to={`/tree/${tree.id}`}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[var(--radius)] px-1.5 py-2 text-center"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border-soft)",
              boxShadow: "var(--shadow-soft)",
            }}
          >
            <GrowthIcon
              stage={growth.stage}
              color={getTreeColor(tree).color}
              size={32}
            />
            <span className="line-clamp-2 text-sm font-medium leading-tight">
              {tree.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
