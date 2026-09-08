import { useState } from "react";
import type { Branch } from "@/lib/types";
import { ALL_DAYS, WEEKDAY_LABELS } from "@/lib/weekdays";
import { useForest } from "@/store/forest-context";
import BottomSheet from "./BottomSheet";

type Mode =
  | { kind: "add"; slot: number }
  | { kind: "edit"; branch: Branch };

// 요일 칩은 월요일부터 보여주는 게 자연스러움 → 표시 순서만 월~일, 값은 0(일)~6(토).
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

// 세부목표(가지) 추가/수정 시트. 나무 상세 화면 안에서만 열림.
export default function BranchSheet({
  open,
  onClose,
  treeId,
  mode,
  accentColor,
}: {
  open: boolean;
  onClose: () => void;
  treeId: string;
  mode: Mode | null;
  accentColor: string;
}) {
  const { addBranch, updateBranch, deleteBranch } = useForest();

  // 부모(TreeDetailPage)가 mode마다 다른 key를 주므로, 시트가 열릴 때마다
  // 이 컴포넌트는 새로 마운트됨 → useState 초기값으로 폼을 채우면 충분.
  const [name, setName] = useState(mode?.kind === "edit" ? mode.branch.name : "");
  const [type, setType] = useState<Branch["type"]>(
    mode?.kind === "edit" ? mode.branch.type : "recurring"
  );
  const [days, setDays] = useState<number[]>(
    mode?.kind === "edit" && mode.branch.routines[0]?.days
      ? mode.branch.routines[0].days
      : [...ALL_DAYS]
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  if (!mode) return null;

  const daysValid = type === "one_time" || days.length > 0;
  const canSave = name.trim().length > 0 && daysValid;

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function handleSave() {
    if (!canSave || !mode) return;
    if (mode.kind === "add") {
      addBranch(treeId, { slot: mode.slot, name, type, days });
    } else {
      updateBranch(treeId, mode.branch.id, { name, type, days });
    }
    onClose();
  }

  function handleDelete() {
    if (!mode || mode.kind !== "edit") return;
    deleteBranch(treeId, mode.branch.id);
    onClose();
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={mode.kind === "add" ? "세부목표 추가" : "세부목표 수정"}
    >
      <label className="mb-1.5 block text-sm text-[var(--muted)]">
        무엇을 할 건가요?
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="예: 30분 걷기, 항공권 예약"
        autoFocus
        className="mb-4 w-full rounded-[var(--radius)] border px-3.5 py-3 text-base"
        style={{ borderColor: "var(--border)" }}
      />

      <label className="mb-1.5 block text-sm text-[var(--muted)]">유형</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("recurring")}
          className="rounded-[var(--radius)] border px-3 py-2.5 text-sm"
          style={
            type === "recurring"
              ? { borderColor: accentColor, color: accentColor, borderWidth: 2 }
              : { borderColor: "var(--border)", color: "var(--muted)" }
          }
        >
          반복형 · 꾸준히 물주기
        </button>
        <button
          type="button"
          onClick={() => setType("one_time")}
          className="rounded-[var(--radius)] border px-3 py-2.5 text-sm"
          style={
            type === "one_time"
              ? { borderColor: accentColor, color: accentColor, borderWidth: 2 }
              : { borderColor: "var(--border)", color: "var(--muted)" }
          }
        >
          단발성 · 한 번 끝내기
        </button>
      </div>

      {type === "recurring" && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm text-[var(--muted)]">무슨 요일에?</label>
            <button
              type="button"
              onClick={() => setDays(days.length === 7 ? [] : [...ALL_DAYS])}
              className="text-sm underline"
              style={{ color: accentColor }}
            >
              {days.length === 7 ? "모두 해제" : "매일"}
            </button>
          </div>
          <div className="flex gap-1.5">
            {DAY_ORDER.map((d) => {
              const on = days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className="flex-1 rounded-[var(--radius)] border py-2.5 text-sm"
                  style={
                    on
                      ? {
                          background: accentColor,
                          borderColor: accentColor,
                          color: "#fff",
                        }
                      : { borderColor: "var(--border)", color: "var(--muted)" }
                  }
                >
                  {WEEKDAY_LABELS[d]}
                </button>
              );
            })}
          </div>
          {days.length === 0 && (
            <p className="mt-1.5 text-sm" style={{ color: "#b23c3c" }}>
              최소 하루는 골라주세요
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white disabled:opacity-40"
        style={{ background: accentColor }}
      >
        {mode.kind === "add" ? "가지 더하기" : "저장"}
      </button>

      {mode.kind === "edit" &&
        (confirmingDelete ? (
          <div
            className="mt-3 rounded-[var(--radius)] border px-3.5 py-3.5 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <p className="mb-2.5 text-sm text-[var(--muted)]">
              이 세부목표와 기록을 지울까요? 되돌릴 수 없어요.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-[var(--radius)] border px-3 py-2.5 text-sm"
                style={{ borderColor: "var(--border)" }}
              >
                그대로 두기
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-[var(--radius)] px-3 py-2.5 text-sm font-medium text-white"
                style={{ background: "#b23c3c" }}
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 w-full py-2 text-center text-sm text-[var(--muted)] underline"
          >
            세부목표 삭제
          </button>
        ))}
    </BottomSheet>
  );
}
