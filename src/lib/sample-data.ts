import type { Forest } from "./types";

// localStorage가 비어있을 때 처음 한 번만 심어지는 시드 데이터 (레이아웃 확인용).
// 이후에는 사용자가 추가/수정/삭제한 내용이 localStorage에 저장되고 이 파일은 무시됨.
const currentYear = new Date().getFullYear();
const EVERYDAY = [0, 1, 2, 3, 4, 5, 6];

// n일 전 오전 9시의 ISO 문자열 (기록 화면 데모용 물주기 로그)
function daysAgo(...offsets: number[]): string[] {
  return offsets.map((d) => {
    const dt = new Date();
    dt.setDate(dt.getDate() - d);
    dt.setHours(9, 0, 0, 0);
    return dt.toISOString();
  });
}

const walkLog = daysAgo(1, 2, 4, 6, 8, 9, 11, 13, 15, 18, 20);
const waterLog = daysAgo(0, 1, 2, 3, 5, 6, 7, 9, 10, 12, 14, 16, 19, 21);
const reactLog = daysAgo(3, 6, 10, 13, 17, 24);
const tripLog = daysAgo(2, 9, 16, 23);

export const sampleForest: Forest = {
  id: "forest-seed",
  year: currentYear,
  theme: null,
  trees: [
    {
      id: "tree-1",
      forestId: "forest-seed",
      slot: 1,
      name: "건강한 몸으로 여행하기",
      branches: [
        {
          id: "branch-1-1",
          treeId: "tree-1",
          name: "30분 걷기",
          type: "recurring",
          completedAt: null,
          slot: 1,
          routines: [
            {
              id: "routine-1-1",
              branchId: "branch-1-1",
              name: "30분 걷기",
              days: EVERYDAY,
              waterCount: walkLog.length,
              lastWateredAt: walkLog[walkLog.length - 1],
              log: walkLog,
            },
          ],
        },
        {
          id: "branch-1-2",
          treeId: "tree-1",
          name: "물 2L 마시기",
          type: "recurring",
          completedAt: null,
          slot: 2,
          routines: [
            {
              id: "routine-1-2",
              branchId: "branch-1-2",
              name: "물 2L 마시기",
              days: EVERYDAY,
              waterCount: waterLog.length,
              lastWateredAt: waterLog[waterLog.length - 1],
              log: waterLog,
            },
          ],
        },
      ],
    },
    {
      id: "tree-2",
      forestId: "forest-seed",
      slot: 2,
      name: "사이드 프로젝트로 수익 만들기",
      branches: [
        {
          id: "branch-2-1",
          treeId: "tree-2",
          name: "React 공부 30분",
          type: "recurring",
          completedAt: null,
          slot: 1,
          routines: [
            {
              id: "routine-2-1",
              branchId: "branch-2-1",
              name: "React 공부 30분",
              days: [1, 2, 3, 4, 5],
              waterCount: reactLog.length,
              lastWateredAt: reactLog[reactLog.length - 1],
              log: reactLog,
            },
          ],
        },
      ],
    },
    {
      id: "tree-3",
      forestId: "forest-seed",
      slot: 3,
      name: "터키 여행",
      branches: [
        {
          id: "branch-3-1",
          treeId: "tree-3",
          name: "항공권 예약",
          type: "one_time",
          completedAt: new Date().toISOString(),
          slot: 1,
          routines: [],
        },
        {
          id: "branch-3-2",
          treeId: "tree-3",
          name: "여행지 조사",
          type: "recurring",
          completedAt: null,
          slot: 2,
          routines: [
            {
              id: "routine-3-2",
              branchId: "branch-3-2",
              name: "여행지 3곳 조사",
              days: [6, 0],
              waterCount: tripLog.length,
              lastWateredAt: tripLog[tripLog.length - 1],
              log: tripLog,
            },
          ],
        },
      ],
    },
  ],
};
