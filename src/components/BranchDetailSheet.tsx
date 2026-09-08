import type { Branch } from "@/lib/types";
import type { SlotColor } from "@/lib/categories";
import { isToday } from "@/lib/dates";
import { formatDays } from "@/lib/weekdays";
import { useForest } from "@/store/forest-context";
import BottomSheet from "./BottomSheet";
import WaterDrop from "./WaterDrop";

// 가지(세부목표) 상세 - 물주기 / 단발성 완료 토글 / 수정 진입.
// 예전엔 화면 하단 인라인 패널이었는데 바텀시트로 통일.
export default function BranchDetailSheet({
  open,
  onClose,
  branch,
  treeId,
  slotColor,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  branch: Branch | null;
  treeId: string;
  slotColor: SlotColor;
  onEdit: (branch: Branch) => void;
}) {
  const { waterRoutine, toggleBranchComplete } = useForest();

  if (!branch) return null;

  return (
    <BottomSheet open={open} onClose={onClose} title={branch.name}>
      {branch.type === "one_time" ? (
        <button
          type="button"
          onClick={() => toggleBranchComplete(treeId, branch.id)}
          className="flex w-full items-center gap-3 rounded-[var(--radius)] px-3.5 py-3.5 text-left"
          style={{ background: "var(--card-sunken)" }}
        >
          <WaterDrop
            filled={!!branch.completedAt}
            color={slotColor.color}
            size={28}
          />
          <span>
            <span className="block text-base">
              {branch.completedAt ? "끝냈어요 (눌러서 취소)" : "다 끝냈다면 눌러요"}
            </span>
            <span className="block text-sm text-[var(--muted)]">
              한 번 끝내는 목표
            </span>
          </span>
        </button>
      ) : branch.routines.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">연결된 루틴이 없어요.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {branch.routines.map((r) => {
            const wateredToday = isToday(r.lastWateredAt);
            return (
              <button
                key={r.id}
                type="button"
                onClick={() =>
                  waterRoutine(treeId, branch.id, r.id, wateredToday)
                }
                className="flex w-full items-center gap-3 rounded-[var(--radius)] px-3.5 py-3.5 text-left"
                style={{ background: "var(--card-sunken)" }}
              >
                <WaterDrop
                  filled={wateredToday}
                  color={slotColor.color}
                  size={28}
                />
                <span>
                  <span className="block text-base">
                    {wateredToday ? "오늘 물 줬어요" : "오늘 물주기"}
                  </span>
                  <span className="block text-sm text-[var(--muted)]">
                    {formatDays(r.days)} · 누적 {r.waterCount}회
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={() => onEdit(branch)}
        className="mt-3 w-full py-2 text-center text-sm text-[var(--muted)] underline"
      >
        세부목표 수정
      </button>
    </BottomSheet>
  );
}
