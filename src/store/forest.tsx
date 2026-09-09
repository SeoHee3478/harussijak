// 숲 상태 저장소 - React Context + Supabase.
// (순수 조작 로직은 src/lib/forest-ops.ts에 분리 - RN 이전 시 재사용)
//
// 패턴: 사용자가 뭔가 하면 ①로컬 상태를 ops.*로 즉시 바꿔서 화면에 바로 반영하고,
// ②동시에 Supabase에 같은 내용을 써서 영속화함. 같은 id를 로컬(ops.build*)과 DB에
// 그대로 쓰기 때문에 나중에 다시 맞출 필요가 없음. 쓰기가 실패해도 콘솔에만 남기고
// 화면은 막지 않음(이 앱의 "부담 없이" 톤 유지) - 대신 새로고침하면 DB 상태로 돌아옴.

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Branch, Forest, Routine, Tree } from "@/lib/types";
import { ALL_DAYS } from "@/lib/weekdays";
import { isSameDay } from "@/lib/dates";
import * as ops from "@/lib/forest-ops";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";
import { ForestContext, type ForestContextValue } from "./forest-context";

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------- DB 행(snake_case) → 앱 타입(camelCase) 매핑 ----------

interface WateringRow {
  watered_at: string;
}
interface RoutineRow {
  id: string;
  name: string;
  days: number[] | null;
  waterings: WateringRow[] | null;
}
interface BranchRow {
  id: string;
  name: string;
  type: Branch["type"];
  completed_at: string | null;
  slot: number;
  routines: RoutineRow[] | null;
}
interface TreeRow {
  id: string;
  slot: number;
  name: string;
  color_key: number | null;
  branches: BranchRow[] | null;
}
interface ForestRow {
  id: string;
  year: number;
  theme: string | null;
  trees: TreeRow[] | null;
}

const FOREST_SELECT = `
  id, year, theme,
  trees ( id, slot, name, color_key,
    branches ( id, name, type, completed_at, slot,
      routines ( id, name, days,
        waterings ( watered_at )
      )
    )
  )
`;

function mapRoutine(branchId: string, r: RoutineRow): Routine {
  const log = (r.waterings ?? []).map((w) => w.watered_at).sort();
  return {
    id: r.id,
    branchId,
    name: r.name,
    days: r.days && r.days.length > 0 ? r.days : [...ALL_DAYS],
    waterCount: log.length,
    lastWateredAt: log.length ? log[log.length - 1] : null,
    log,
  };
}

function mapBranch(treeId: string, b: BranchRow): Branch {
  return {
    id: b.id,
    treeId,
    name: b.name,
    type: b.type,
    completedAt: b.completed_at,
    slot: b.slot,
    routines: (b.routines ?? []).map((r) => mapRoutine(b.id, r)),
  };
}

function mapTree(forestId: string, t: TreeRow): Tree {
  return {
    id: t.id,
    forestId,
    slot: t.slot,
    name: t.name,
    colorKey: t.color_key ?? undefined,
    branches: (t.branches ?? []).map((b) => mapBranch(t.id, b)),
  };
}

function mapForest(row: ForestRow): Forest {
  return {
    id: row.id,
    year: row.year,
    theme: row.theme,
    trees: (row.trees ?? [])
      .map((t) => mapTree(row.id, t))
      .sort((a, b) => a.slot - b.slot),
  };
}

function emptyForest(year: number): Forest {
  return { id: "", year, theme: null, trees: [] };
}

export function ForestProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const [forest, setForest] = useState<Forest>(() => emptyForest(year));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("forests")
        .select(FOREST_SELECT)
        .eq("year", year)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("[forest] load failed", error);
        setLoading(false);
        return;
      }

      if (data) {
        setForest(mapForest(data as unknown as ForestRow));
        setLoading(false);
        return;
      }

      // 올해 숲이 아직 없으면 새로 만듦 (첫 로그인)
      const { data: created, error: insertError } = await supabase
        .from("forests")
        .insert({ user_id: user.id, year })
        .select("id, year, theme")
        .single();

      if (cancelled) return;

      if (insertError || !created) {
        console.error("[forest] create failed", insertError);
        setLoading(false);
        return;
      }

      setForest({
        id: created.id,
        year: created.year,
        theme: created.theme,
        trees: [],
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, year]);

  const addTree = useCallback<ForestContextValue["addTree"]>(
    (input) => {
      const tree = ops.buildTree({ forestId: forest.id, ...input });
      setForest((f) => ops.addTree(f, tree));
      supabase
        .from("trees")
        .insert({
          id: tree.id,
          forest_id: forest.id,
          slot: tree.slot,
          name: tree.name,
        })
        .then(({ error }) => {
          if (error) console.error("[tree] add failed", error);
        });
      return tree;
    },
    [forest.id]
  );

  const updateTree = useCallback<ForestContextValue["updateTree"]>(
    (treeId, patch) => {
      setForest((f) => ops.updateTree(f, treeId, patch));
      const dbPatch: Record<string, unknown> = {};
      if (patch.name !== undefined) dbPatch.name = patch.name.trim();
      if (patch.colorKey !== undefined) dbPatch.color_key = patch.colorKey;
      supabase
        .from("trees")
        .update(dbPatch)
        .eq("id", treeId)
        .then(({ error }) => {
          if (error) console.error("[tree] update failed", error);
        });
    },
    []
  );

  const deleteTree = useCallback<ForestContextValue["deleteTree"]>((treeId) => {
    setForest((f) => ops.removeTree(f, treeId));
    supabase
      .from("trees")
      .delete()
      .eq("id", treeId)
      .then(({ error }) => {
        if (error) console.error("[tree] delete failed", error);
      });
  }, []);

  const addBranch = useCallback<ForestContextValue["addBranch"]>(
    (treeId, input) => {
      const branch = ops.buildBranch({ treeId, ...input });
      setForest((f) => ops.addBranch(f, treeId, branch));
      (async () => {
        const { error: branchError } = await supabase.from("branches").insert({
          id: branch.id,
          tree_id: treeId,
          name: branch.name,
          type: branch.type,
          completed_at: branch.completedAt,
          slot: branch.slot,
        });
        if (branchError) console.error("[branch] add failed", branchError);

        const routine = branch.routines[0];
        if (routine) {
          const { error: routineError } = await supabase.from("routines").insert({
            id: routine.id,
            branch_id: branch.id,
            name: routine.name,
            days: routine.days,
          });
          if (routineError) console.error("[routine] add failed", routineError);
        }
      })();
      return branch;
    },
    []
  );

  const updateBranch = useCallback<ForestContextValue["updateBranch"]>(
    (treeId, branchId, patch) => {
      const before = forest.trees
        .find((t) => t.id === treeId)
        ?.branches.find((b) => b.id === branchId);

      setForest((f) => ops.updateBranch(f, treeId, branchId, patch));
      if (!before) return;

      const name = patch.name !== undefined ? patch.name.trim() : before.name;
      const type = patch.type ?? before.type;

      (async () => {
        const { error: branchError } = await supabase
          .from("branches")
          .update({ name, type })
          .eq("id", branchId);
        if (branchError) console.error("[branch] update failed", branchError);

        if (type === "recurring") {
          const days =
            patch.days && patch.days.length > 0
              ? patch.days
              : (before.routines[0]?.days ?? [...ALL_DAYS]);

          if (before.routines.length === 0) {
            // 단발성 → 반복형 전환: 루틴 새로 생성
            const { error } = await supabase.from("routines").insert({
              id: uuid(),
              branch_id: branchId,
              name,
              days,
            });
            if (error) console.error("[routine] create failed", error);
          } else {
            const { error } = await supabase
              .from("routines")
              .update({ name, days })
              .eq("id", before.routines[0].id);
            if (error) console.error("[routine] update failed", error);
          }
        } else if (before.routines.length > 0) {
          // 반복형 → 단발성 전환: 루틴 제거 (물주기 기록은 cascade로 함께 삭제)
          const { error } = await supabase
            .from("routines")
            .delete()
            .eq("branch_id", branchId);
          if (error) console.error("[routine] delete failed", error);
        }
      })();
    },
    [forest.trees]
  );

  const deleteBranch = useCallback<ForestContextValue["deleteBranch"]>(
    (treeId, branchId) => {
      setForest((f) => ops.removeBranch(f, treeId, branchId));
      supabase
        .from("branches")
        .delete()
        .eq("id", branchId)
        .then(({ error }) => {
          if (error) console.error("[branch] delete failed", error);
        });
    },
    []
  );

  const toggleBranchComplete = useCallback<
    ForestContextValue["toggleBranchComplete"]
  >(
    (treeId, branchId) => {
      const before = forest.trees
        .find((t) => t.id === treeId)
        ?.branches.find((b) => b.id === branchId);
      const nextCompletedAt = before?.completedAt
        ? null
        : new Date().toISOString();

      setForest((f) => ops.toggleBranchComplete(f, treeId, branchId));
      supabase
        .from("branches")
        .update({ completed_at: nextCompletedAt })
        .eq("id", branchId)
        .then(({ error }) => {
          if (error) console.error("[branch] toggle failed", error);
        });
    },
    [forest.trees]
  );

  const waterRoutine = useCallback<ForestContextValue["waterRoutine"]>(
    (treeId, branchId, routineId, wateredTodayAlready) => {
      setForest((f) =>
        ops.waterRoutine(f, treeId, branchId, routineId, wateredTodayAlready)
      );

      (async () => {
        if (wateredTodayAlready) {
          // 되돌리기: 오늘 찍힌 기록만 제거 (로컬 ops와 동일한 기준)
          const { data, error: fetchError } = await supabase
            .from("waterings")
            .select("id, watered_at")
            .eq("routine_id", routineId);
          if (fetchError) {
            console.error("[watering] undo lookup failed", fetchError);
            return;
          }
          const now = new Date();
          const idsToday = (data ?? [])
            .filter((w) => isSameDay(new Date(w.watered_at), now))
            .map((w) => w.id);
          if (idsToday.length > 0) {
            const { error } = await supabase
              .from("waterings")
              .delete()
              .in("id", idsToday);
            if (error) console.error("[watering] undo failed", error);
          }
        } else {
          const { error } = await supabase.from("waterings").insert({
            routine_id: routineId,
            watered_at: new Date().toISOString(),
          });
          if (error) console.error("[watering] add failed", error);
        }
      })();
    },
    []
  );

  const setTheme = useCallback<ForestContextValue["setTheme"]>(
    (theme) => {
      setForest((f) => ops.updateTheme(f, theme));
      const trimmed = theme.trim();
      supabase
        .from("forests")
        .update({ theme: trimmed.length > 0 ? trimmed : null })
        .eq("id", forest.id)
        .then(({ error }) => {
          if (error) console.error("[forest] theme update failed", error);
        });
    },
    [forest.id]
  );

  const value = useMemo<ForestContextValue>(
    () => ({
      forest,
      loading,
      addTree,
      updateTree,
      deleteTree,
      addBranch,
      updateBranch,
      deleteBranch,
      toggleBranchComplete,
      waterRoutine,
      setTheme,
    }),
    [
      forest,
      loading,
      addTree,
      updateTree,
      deleteTree,
      addBranch,
      updateBranch,
      deleteBranch,
      toggleBranchComplete,
      waterRoutine,
      setTheme,
    ]
  );

  return (
    <ForestContext.Provider value={value}>{children}</ForestContext.Provider>
  );
}
