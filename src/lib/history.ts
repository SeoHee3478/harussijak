// 기록 화면(캘린더·타임라인) 집계 - 순수 함수만.

import type { Forest, Tree } from "./types";
import { dateKey } from "./dates";

export interface DayEntry {
  kind: "water" | "done"; // 물주기 / 단발성 완료
  treeId: string;
  treeName: string;
  treeSlot: number;
  treeColorKey?: number;
  label: string; // 루틴 이름 또는 가지 이름
}

// 날짜별로 "그 날 한 일" 목록. filterTreeId를 주면 그 나무만.
export function dayEntries(
  forest: Forest,
  filterTreeId?: string
): Map<string, DayEntry[]> {
  const m = new Map<string, DayEntry[]>();
  const push = (k: string, e: DayEntry) => {
    const arr = m.get(k);
    if (arr) arr.push(e);
    else m.set(k, [e]);
  };

  for (const t of forest.trees) {
    if (filterTreeId && t.id !== filterTreeId) continue;
    const base = {
      treeId: t.id,
      treeName: t.name,
      treeSlot: t.slot,
      treeColorKey: t.colorKey,
    };
    for (const b of t.branches) {
      for (const r of b.routines)
        for (const iso of r.log)
          push(dateKey(new Date(iso)), { ...base, kind: "water", label: r.name });
      if (b.type === "one_time" && b.completedAt)
        push(dateKey(new Date(b.completedAt)), {
          ...base,
          kind: "done",
          label: b.name,
        });
    }
  }
  return m;
}

// 날짜별 개수 (달력 잎 진하기용)
export function countsFromEntries(
  entries: Map<string, DayEntry[]>
): Map<string, number> {
  const m = new Map<string, number>();
  for (const [k, v] of entries) m.set(k, v.length);
  return m;
}

// 한 나무: 날짜별 물주기 횟수 (타임라인용)
export function treeWaterCountsByDate(tree: Tree): Map<string, number> {
  const m = new Map<string, number>();
  for (const b of tree.branches)
    for (const r of b.routines)
      for (const iso of r.log) {
        const k = dateKey(new Date(iso));
        m.set(k, (m.get(k) ?? 0) + 1);
      }
  return m;
}

// 달력 격자: (year, month0) → 주 배열. 앞뒤 빈칸은 null.
export function monthMatrix(year: number, month0: number): (Date | null)[][] {
  const startDow = new Date(year, month0, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month0, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// 해당 월에 뭔가 한 날의 수
export function activeDaysInMonth(
  counts: Map<string, number>,
  year: number,
  month0: number
): number {
  const prefix = `${year}-${String(month0 + 1).padStart(2, "0")}-`;
  let n = 0;
  for (const [k, v] of counts) if (k.startsWith(prefix) && v > 0) n++;
  return n;
}

// 0~1 사이 잎 진하기 (0회=0, 1회≈0.35, 2회≈0.6, 3~4회≈0.85, 5회+=1)
export function leafShade(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 0.35;
  if (count === 2) return 0.6;
  if (count <= 4) return 0.85;
  return 1;
}
