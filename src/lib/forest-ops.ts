// 숲 데이터 조작 - 순수 함수만. (Forest in) -> (새 Forest out), 부수효과·UI·DB 의존 없음.
// React Context나 Supabase 연동은 이 함수들을 감싸기만 함 → RN 이전 시 그대로 재사용.

import type { Branch, Forest, Routine, Tree } from "./types";
import { ALL_DAYS } from "./weekdays";
import { isSameDay } from "./dates";

function uuid(): string {
  // 브라우저/RN(Hermes) 모두 지원. 구형 환경 폴백 포함.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------- 빌더 ----------

export function buildTree(input: {
  forestId: string;
  slot: number;
  name: string;
}): Tree {
  return {
    id: uuid(),
    forestId: input.forestId,
    slot: input.slot,
    name: input.name.trim(),
    branches: [],
  };
}

export function buildBranch(input: {
  treeId: string;
  slot: number;
  name: string;
  type: Branch["type"];
  days?: number[];
}): Branch {
  const id = uuid();
  const name = input.name.trim();
  // 반복형 가지는 실행 루틴 1개를 자동 생성 (MVP: 가지 = 루틴 1:1).
  const routines: Routine[] =
    input.type === "recurring"
      ? [
          {
            id: uuid(),
            branchId: id,
            name,
            days:
              input.days && input.days.length > 0 ? input.days : [...ALL_DAYS],
            waterCount: 0,
            lastWateredAt: null,
            log: [],
          },
        ]
      : [];
  return {
    id,
    treeId: input.treeId,
    name,
    type: input.type,
    completedAt: null,
    slot: input.slot,
    routines,
  };
}

// ---------- Tree ----------

export function addTree(forest: Forest, tree: Tree): Forest {
  return { ...forest, trees: [...forest.trees, tree] };
}

export function updateTree(
  forest: Forest,
  treeId: string,
  patch: Partial<Pick<Tree, "name" | "colorKey">>
): Forest {
  return {
    ...forest,
    trees: forest.trees.map((t) =>
      t.id === treeId
        ? {
            ...t,
            ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
            ...(patch.colorKey !== undefined
              ? { colorKey: patch.colorKey }
              : {}),
          }
        : t
    ),
  };
}

export function removeTree(forest: Forest, treeId: string): Forest {
  return { ...forest, trees: forest.trees.filter((t) => t.id !== treeId) };
}

// ---------- Branch ----------

function mapTree(forest: Forest, treeId: string, fn: (t: Tree) => Tree): Forest {
  return {
    ...forest,
    trees: forest.trees.map((t) => (t.id === treeId ? fn(t) : t)),
  };
}

export function addBranch(forest: Forest, treeId: string, branch: Branch): Forest {
  return mapTree(forest, treeId, (t) => ({
    ...t,
    branches: [...t.branches, branch],
  }));
}

export function updateBranch(
  forest: Forest,
  treeId: string,
  branchId: string,
  patch: { name?: string; type?: Branch["type"]; days?: number[] }
): Forest {
  return mapTree(forest, treeId, (t) => ({
    ...t,
    branches: t.branches.map((b) => {
      if (b.id !== branchId) return b;
      const name = patch.name !== undefined ? patch.name.trim() : b.name;
      const type = patch.type ?? b.type;

      let routines = b.routines;
      if (type === "recurring") {
        const days =
          patch.days && patch.days.length > 0
            ? patch.days
            : (routines[0]?.days ?? [...ALL_DAYS]);
        if (routines.length === 0) {
          // 단발성 → 반복형 전환: 루틴 새로 생성
          routines = [
            {
              id: uuid(),
              branchId: b.id,
              name,
              days,
              waterCount: 0,
              lastWateredAt: null,
              log: [],
            },
          ];
        } else {
          // 첫 루틴의 이름/요일을 가지와 동기화 (MVP: 1:1)
          routines = routines.map((r, i) =>
            i === 0 ? { ...r, name, days } : r
          );
        }
      } else {
        // 반복형 → 단발성 전환: 루틴 제거
        routines = [];
      }

      return { ...b, name, type, routines };
    }),
  }));
}

export function removeBranch(
  forest: Forest,
  treeId: string,
  branchId: string
): Forest {
  return mapTree(forest, treeId, (t) => ({
    ...t,
    branches: t.branches.filter((b) => b.id !== branchId),
  }));
}

// 단발성 가지 완료/해제 토글
export function toggleBranchComplete(
  forest: Forest,
  treeId: string,
  branchId: string
): Forest {
  return mapTree(forest, treeId, (t) => ({
    ...t,
    branches: t.branches.map((b) =>
      b.id === branchId
        ? { ...b, completedAt: b.completedAt ? null : new Date().toISOString() }
        : b
    ),
  }));
}

// ---------- Watering ----------

// 반복형 루틴에 물주기: 오늘 이미 줬으면 취소(되돌리기), 아니면 +1.
export function waterRoutine(
  forest: Forest,
  treeId: string,
  branchId: string,
  routineId: string,
  wateredTodayAlready: boolean
): Forest {
  return mapTree(forest, treeId, (t) => ({
    ...t,
    branches: t.branches.map((b) => {
      if (b.id !== branchId) return b;
      return {
        ...b,
        routines: b.routines.map((r) => {
          if (r.id !== routineId) return r;
          if (wateredTodayAlready) {
            // 되돌리기: 오늘 찍힌 기록만 제거
            const log = r.log.filter(
              (iso) => !isSameDay(new Date(iso), new Date())
            );
            return {
              ...r,
              waterCount: Math.max(0, r.waterCount - 1),
              lastWateredAt: log.length ? log[log.length - 1] : null,
              log,
            };
          }
          const now = new Date().toISOString();
          return {
            ...r,
            waterCount: r.waterCount + 1,
            lastWateredAt: now,
            log: [...r.log, now],
          };
        }),
      };
    }),
  }));
}

// ---------- Forest ----------

export function updateTheme(forest: Forest, theme: string): Forest {
  const trimmed = theme.trim();
  return { ...forest, theme: trimmed.length > 0 ? trimmed : null };
}
