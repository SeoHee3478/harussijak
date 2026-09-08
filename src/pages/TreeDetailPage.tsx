import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getTreeColor } from "@/lib/categories";
import {
  calculateTreeGrowth,
  GROWTH_LABELS,
  growthSentence,
} from "@/lib/growth";
import { useTree } from "@/store/forest-context";
import BranchSheet from "@/components/BranchSheet";
import BranchDetailSheet from "@/components/BranchDetailSheet";
import TreeSheet from "@/components/TreeSheet";
import GrowthIcon from "@/components/GrowthIcon";
import type { Branch } from "@/lib/types";

const CENTER_INDEX = 4;

type BranchSheetState =
  | { kind: "add"; slot: number }
  | { kind: "edit"; branch: Branch }
  | null;

export default function TreeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tree = useTree(id);

  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [branchSheet, setBranchSheet] = useState<BranchSheetState>(null);
  const [treeSheetOpen, setTreeSheetOpen] = useState(false);

  if (!tree) {
    return (
      <main className="mx-auto max-w-[400px] px-4 py-6">
        <p className="text-base text-[var(--muted)]">나무를 찾을 수 없어요.</p>
        <Link to="/" className="mt-3 inline-block text-sm underline">
          숲으로 돌아가기
        </Link>
      </main>
    );
  }

  const slotColor = getTreeColor(tree);
  const growth = calculateTreeGrowth(
    tree.branches.map((b) => ({
      type: b.type,
      isCompleted: !!b.completedAt,
      waterCount: b.routines.reduce((s, r) => s + r.waterCount, 0),
    }))
  );
  const branchesBySlot = Object.fromEntries(tree.branches.map((b) => [b.slot, b]));

  const cells: ("center" | number)[] = [];
  let branchSlot = 1;
  for (let i = 0; i < 9; i++) {
    if (i === CENTER_INDEX) cells.push("center");
    else {
      cells.push(branchSlot);
      branchSlot++;
    }
  }

  const selectedBranch =
    tree.branches.find((b) => b.id === selectedBranchId) ?? null;

  return (
    <main className="mx-auto max-w-[400px] px-4 pb-16 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-[var(--muted)]"
        >
          <span aria-hidden>←</span>
          숲으로
        </button>

        <button
          type="button"
          onClick={() => setTreeSheetOpen(true)}
          className="px-2 py-1 text-xl leading-none text-[var(--muted)]"
          aria-label="목표 수정·삭제"
        >
          ⋯
        </button>
      </div>

      <div className="mb-3 flex items-start gap-3">
        <span
          className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{ background: slotColor.bg }}
        >
          <GrowthIcon stage={growth.stage} color={slotColor.color} size={34} />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold leading-tight">{tree.name}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {GROWTH_LABELS[growth.stage]} · 가지 {tree.branches.length}/8
          </p>
        </div>
      </div>

      {/* 진행률 - 그래프/퍼센트 대신 문장 (CLAUDE.md 원칙) */}
      <p
        className="mb-5 rounded-[var(--radius)] px-3.5 py-2.5 text-sm"
        style={{ background: slotColor.bg, color: slotColor.color }}
      >
        {growthSentence(growth.points)}
      </p>

      <div className="grid grid-cols-3 gap-2.5">
        {cells.map((cell) => {
          if (cell === "center") {
            return (
              <button
                key="center"
                type="button"
                onClick={() => setTreeSheetOpen(true)}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius)] p-1.5 text-center"
                style={{
                  background: "var(--card-sunken)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                <GrowthIcon
                  stage={growth.stage}
                  color={slotColor.color}
                  size={28}
                />
                <span className="line-clamp-2 text-xs font-medium leading-tight text-[var(--muted)]">
                  {tree.name}
                </span>
              </button>
            );
          }

          const branch = branchesBySlot[cell];

          if (!branch) {
            return (
              <button
                key={cell}
                type="button"
                className="flex aspect-square items-center justify-center rounded-[var(--radius)] border border-dashed text-[var(--muted)] transition-colors hover:bg-[var(--card-sunken)]"
                style={{ borderColor: "var(--border)" }}
                onClick={() => {
                  setSelectedBranchId(null);
                  setBranchSheet({ kind: "add", slot: cell });
                }}
              >
                <span className="text-2xl font-light">+</span>
              </button>
            );
          }

          const isOneTime = branch.type === "one_time";
          const isCompleted = !!branch.completedAt;
          const waterCount = branch.routines.reduce(
            (s, r) => s + r.waterCount,
            0
          );
          const doneOneTime = isOneTime && isCompleted;

          return (
            <button
              key={cell}
              type="button"
              onClick={() => setSelectedBranchId(branch.id)}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius)] px-1.5 py-2 text-center"
              style={{
                border: "1px solid var(--border-soft)",
                background: doneOneTime ? slotColor.bg : "var(--card)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <span
                className="line-clamp-3 text-sm font-medium leading-tight"
                style={doneOneTime ? { color: slotColor.color } : undefined}
              >
                {branch.name}
              </span>
              {isOneTime ? (
                doneOneTime && (
                  <span className="text-xs" style={{ color: slotColor.color }}>
                    완료
                  </span>
                )
              ) : (
                <span className="text-xs text-[var(--muted)]">
                  물 {waterCount}회
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-sm leading-relaxed text-[var(--muted)]">
        빈 칸의 +를 눌러 세부목표를 더하고
        <br />
        가지를 눌러 자세히 봐요
      </p>

      <BranchDetailSheet
        open={selectedBranch !== null}
        onClose={() => setSelectedBranchId(null)}
        branch={selectedBranch}
        treeId={tree.id}
        slotColor={slotColor}
        onEdit={(b) => {
          setSelectedBranchId(null);
          setBranchSheet({ kind: "edit", branch: b });
        }}
      />

      <BranchSheet
        key={
          branchSheet === null
            ? "none"
            : branchSheet.kind === "edit"
              ? `edit-${branchSheet.branch.id}`
              : `add-${branchSheet.slot}`
        }
        open={branchSheet !== null}
        onClose={() => setBranchSheet(null)}
        treeId={tree.id}
        mode={branchSheet}
        accentColor={slotColor.color}
      />

      <TreeSheet
        key={treeSheetOpen ? `tree-${tree.id}` : "tree-closed"}
        open={treeSheetOpen}
        onClose={() => setTreeSheetOpen(false)}
        tree={tree}
      />
    </main>
  );
}
