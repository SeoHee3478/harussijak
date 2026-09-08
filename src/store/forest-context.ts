// 숲 저장소의 Context 정의 + 소비 훅.
// Provider 구현은 forest.tsx. (fast-refresh 규칙상 컴포넌트 파일과 분리)

import { createContext, useContext } from "react";
import type { Branch, Forest, Tree } from "@/lib/types";

export interface ForestContextValue {
  forest: Forest;

  addTree(input: { slot: number; name: string }): Tree;
  updateTree(
    treeId: string,
    patch: { name?: string; colorKey?: number }
  ): void;
  deleteTree(treeId: string): void;

  addBranch(
    treeId: string,
    input: {
      slot: number;
      name: string;
      type: Branch["type"];
      days?: number[];
    }
  ): Branch;
  updateBranch(
    treeId: string,
    branchId: string,
    patch: { name?: string; type?: Branch["type"]; days?: number[] }
  ): void;
  deleteBranch(treeId: string, branchId: string): void;
  toggleBranchComplete(treeId: string, branchId: string): void;

  waterRoutine(
    treeId: string,
    branchId: string,
    routineId: string,
    wateredTodayAlready: boolean
  ): void;

  setTheme(theme: string): void;
  resetToSample(): void;
}

export const ForestContext = createContext<ForestContextValue | null>(null);

export function useForest(): ForestContextValue {
  const ctx = useContext(ForestContext);
  if (!ctx) throw new Error("useForest must be used within <ForestProvider>");
  return ctx;
}

// 편의 훅 - 특정 나무 하나
export function useTree(treeId: string | undefined): Tree | undefined {
  const { forest } = useForest();
  return forest.trees.find((t) => t.id === treeId);
}
