import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Tree } from "@/lib/types";
import { SLOT_COLOR_LIST, getSlotColor } from "@/lib/categories";
import { useForest } from "@/store/forest-context";
import BottomSheet from "./BottomSheet";

// 나무(큰 목표) 수정/삭제 시트.
export default function TreeSheet({
  open,
  onClose,
  tree,
}: {
  open: boolean;
  onClose: () => void;
  tree: Tree;
}) {
  const { updateTree, deleteTree } = useForest();
  const navigate = useNavigate();

  // 부모가 open 시 key로 새로 마운트 → useState 초기값이면 충분.
  const [name, setName] = useState(tree.name);
  const [colorKey, setColorKey] = useState(tree.colorKey ?? tree.slot);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const canSave = name.trim().length > 0;
  const accent = getSlotColor(colorKey).color;

  function handleSave() {
    if (!canSave) return;
    updateTree(tree.id, { name, colorKey });
    onClose();
  }

  function handleDelete() {
    deleteTree(tree.id);
    navigate("/");
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="목표 수정">
      <label className="mb-1.5 block text-sm text-[var(--muted)]">목표</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="mb-4 w-full rounded-[var(--radius)] border px-3.5 py-3 text-base"
        style={{ borderColor: "var(--border)" }}
      />

      <label className="mb-1.5 block text-sm text-[var(--muted)]">색</label>
      <div className="mb-4 flex flex-wrap gap-2.5">
        {SLOT_COLOR_LIST.map((c, i) => {
          const key = i + 1;
          const selected = key === colorKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setColorKey(key)}
              aria-label={`색 ${key}`}
              aria-pressed={selected}
              className="h-9 w-9 rounded-full"
              style={{
                background: c.color,
                boxShadow: selected
                  ? `0 0 0 2px var(--card), 0 0 0 4px ${c.color}`
                  : "none",
              }}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white disabled:opacity-40"
        style={{ background: accent }}
      >
        저장
      </button>

      {confirmingDelete ? (
        <div
          className="mt-3 rounded-[var(--radius)] border px-3.5 py-3.5 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="mb-2.5 text-sm text-[var(--muted)]">
            이 나무와 모든 세부목표·기록이 사라져요. 되돌릴 수 없어요.
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
              나무 삭제
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmingDelete(true)}
          className="mt-3 w-full py-2 text-center text-sm text-[var(--muted)] underline"
        >
          나무 삭제
        </button>
      )}
    </BottomSheet>
  );
}
