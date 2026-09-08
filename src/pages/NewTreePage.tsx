import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AREA_SUGGESTIONS, getSlotColor } from "@/lib/categories";
import { useForest } from "@/store/forest-context";

export default function NewTreePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { forest, addTree } = useForest();

  // 요청받은 슬롯이 이미 차 있으면 비어있는 첫 슬롯으로.
  const takenSlots = new Set(forest.trees.map((t) => t.slot));
  const requested = Number(params.get("slot")) || 1;
  const slot = !takenSlots.has(requested)
    ? requested
    : ([1, 2, 3, 4, 5, 6, 7, 8].find((s) => !takenSlots.has(s)) ?? requested);

  const slotColor = getSlotColor(slot);

  const [name, setName] = useState("");
  const forestFull = takenSlots.size >= 8;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || forestFull) return;
    const tree = addTree({ slot, name });
    // 심자마자 세부목표를 채울 수 있게 나무 상세로 이동
    navigate(`/tree/${tree.id}`);
  }

  return (
    <main className="mx-auto max-w-[400px] px-4 pb-16 pt-6">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="mb-4 flex items-center gap-1 text-sm text-[var(--muted)]"
      >
        <span aria-hidden>←</span> 숲으로
      </button>

      <p className="mb-1 text-sm text-[var(--muted)]">새 나무 심기</p>
      <h1 className="mb-6 text-2xl font-semibold leading-tight">
        올해 어떤 목표를 심을까요?
      </h1>

      {forestFull && (
        <p
          className="mb-4 rounded-[var(--radius)] border border-dashed px-3.5 py-3.5 text-sm text-[var(--muted)]"
          style={{ borderColor: "var(--border)" }}
        >
          올해 숲의 8칸이 모두 찼어요. 기존 나무를 정리하면 새로 심을 수 있어요.
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="mb-1.5 block text-sm text-[var(--muted)]">목표</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 터키 여행, 건강한 몸 만들기"
          className="mb-3 w-full rounded-[var(--radius)] border px-3.5 py-3 text-base"
          style={{ borderColor: "var(--border)" }}
        />

        {/* 추천 칩 - 막막할 때 시작점만 채워줌, 강제 아님 */}
        <div className="mb-2.5 flex flex-wrap gap-2">
          {AREA_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setName(s.label)}
              className="rounded-full border px-3 py-1.5 text-sm"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mb-6 text-sm text-[var(--muted)]">
          지금 떠오르는 대로 적어도 돼요. 나중에 언제든 고칠 수 있어요.
        </p>

        <button
          type="submit"
          disabled={!name.trim() || forestFull}
          className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white disabled:opacity-40"
          style={{ background: slotColor.color }}
        >
          씨앗 심기
        </button>
        <p className="mt-3 text-center text-sm text-[var(--muted)]">
          세부목표는 나중에 채워도 돼요
        </p>
      </form>
    </main>
  );
}
