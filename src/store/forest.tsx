// 숲 상태 저장소 - React Context + localStorage.
// 지금은 localStorage에 통째로 저장. 나중에 Supabase로 옮길 때 이 파일 내부만
// 쿼리 호출로 바꾸면 되고, 각 함수 시그니처와 페이지 코드는 그대로 유지되도록 설계함.
// (순수 조작 로직은 src/lib/forest-ops.ts에 분리 - RN 이전 시 재사용)

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Forest } from "@/lib/types";
import { sampleForest } from "@/lib/sample-data";
import { ALL_DAYS } from "@/lib/weekdays";
import * as ops from "@/lib/forest-ops";
import { ForestContext, type ForestContextValue } from "./forest-context";

const STORAGE_KEY = "forest-web:forest:v1";

// 예전 스키마로 저장된 데이터를 현재 모양으로 보정.
// - tree.areaLabel(옛 필드) → tree.name 으로 흡수
// - routine.frequency(옛 필드) → routine.days 로 대체 (없으면 매일)
function migrate(raw: unknown): Forest {
  const f = (raw ?? {}) as Record<string, unknown>;
  return {
    id: f.id as string,
    year: f.year as number,
    theme: (f.theme as string | null) ?? null,
    trees: ((f.trees as unknown[]) ?? []).map((tRaw) => {
      const t = tRaw as Record<string, unknown>;
      return {
        id: t.id as string,
        forestId: t.forestId as string,
        slot: t.slot as number,
        name: (t.name as string) ?? (t.areaLabel as string) ?? "목표",
        colorKey:
          typeof t.colorKey === "number" ? (t.colorKey as number) : undefined,
        branches: ((t.branches as unknown[]) ?? []).map((bRaw) => {
          const b = bRaw as Record<string, unknown>;
          return {
            id: b.id as string,
            treeId: b.treeId as string,
            name: b.name as string,
            type: (b.type as "one_time" | "recurring") ?? "recurring",
            completedAt: (b.completedAt as string | null) ?? null,
            slot: b.slot as number,
            routines: ((b.routines as unknown[]) ?? []).map((rRaw) => {
              const r = rRaw as Record<string, unknown>;
              return {
                id: r.id as string,
                branchId: r.branchId as string,
                name: r.name as string,
                days: Array.isArray(r.days)
                  ? (r.days as number[])
                  : [...ALL_DAYS],
                waterCount: (r.waterCount as number) ?? 0,
                lastWateredAt: (r.lastWateredAt as string | null) ?? null,
                log: Array.isArray(r.log) ? (r.log as string[]) : [],
              };
            }),
          };
        }),
      };
    }),
  };
}

function loadForest(): Forest {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch {
    // 파싱 실패 시 시드로 폴백
  }
  return sampleForest;
}

export function ForestProvider({ children }: { children: ReactNode }) {
  const [forest, setForest] = useState<Forest>(loadForest);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(forest));
    } catch {
      // 저장 실패(용량/프라이빗 모드)는 조용히 무시 - 메모리 상태로는 계속 동작
    }
  }, [forest]);

  const addTree = useCallback<ForestContextValue["addTree"]>(
    (input) => {
      const tree = ops.buildTree({ forestId: forest.id, ...input });
      setForest((f) => ops.addTree(f, tree));
      return tree;
    },
    [forest.id]
  );

  const updateTree = useCallback<ForestContextValue["updateTree"]>(
    (treeId, patch) => setForest((f) => ops.updateTree(f, treeId, patch)),
    []
  );

  const deleteTree = useCallback<ForestContextValue["deleteTree"]>(
    (treeId) => setForest((f) => ops.removeTree(f, treeId)),
    []
  );

  const addBranch = useCallback<ForestContextValue["addBranch"]>(
    (treeId, input) => {
      const branch = ops.buildBranch({ treeId, ...input });
      setForest((f) => ops.addBranch(f, treeId, branch));
      return branch;
    },
    []
  );

  const updateBranch = useCallback<ForestContextValue["updateBranch"]>(
    (treeId, branchId, patch) =>
      setForest((f) => ops.updateBranch(f, treeId, branchId, patch)),
    []
  );

  const deleteBranch = useCallback<ForestContextValue["deleteBranch"]>(
    (treeId, branchId) => setForest((f) => ops.removeBranch(f, treeId, branchId)),
    []
  );

  const toggleBranchComplete = useCallback<
    ForestContextValue["toggleBranchComplete"]
  >(
    (treeId, branchId) =>
      setForest((f) => ops.toggleBranchComplete(f, treeId, branchId)),
    []
  );

  const waterRoutine = useCallback<ForestContextValue["waterRoutine"]>(
    (treeId, branchId, routineId, wateredTodayAlready) =>
      setForest((f) =>
        ops.waterRoutine(f, treeId, branchId, routineId, wateredTodayAlready)
      ),
    []
  );

  const setTheme = useCallback<ForestContextValue["setTheme"]>(
    (theme) => setForest((f) => ops.updateTheme(f, theme)),
    []
  );

  const resetToSample = useCallback(() => setForest(sampleForest), []);

  const value = useMemo<ForestContextValue>(
    () => ({
      forest,
      addTree,
      updateTree,
      deleteTree,
      addBranch,
      updateBranch,
      deleteBranch,
      toggleBranchComplete,
      waterRoutine,
      setTheme,
      resetToSample,
    }),
    [
      forest,
      addTree,
      updateTree,
      deleteTree,
      addBranch,
      updateBranch,
      deleteBranch,
      toggleBranchComplete,
      waterRoutine,
      setTheme,
      resetToSample,
    ]
  );

  return (
    <ForestContext.Provider value={value}>{children}</ForestContext.Provider>
  );
}
