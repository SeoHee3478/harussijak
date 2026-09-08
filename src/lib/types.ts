export interface Routine {
  id: string;
  branchId: string;
  name: string;
  // 물주기 대상 요일. 0=일 ~ 6=토. [0..6] 전부면 "매일".
  // "오늘의 물주기"에는 오늘 요일이 포함된 루틴만 뜸.
  days: number[];
  waterCount: number; // 누적 물주기 횟수 (= log.length)
  lastWateredAt: string | null; // 마지막 물준 시각(ISO). "오늘 물줬는지"는 이 값으로 계산 → 자정 지나면 자동 초기화
  log: string[]; // 물 준 시각들(ISO). 기록 화면(캘린더·타임라인)에서 씀. 되돌리기 시 오늘 기록만 제거.
}

export interface Branch {
  id: string;
  treeId: string;
  name: string;
  type: "one_time" | "recurring";
  completedAt: string | null;
  slot: number; // 1~8
  routines: Routine[];
}

export interface Tree {
  id: string;
  forestId: string;
  slot: number; // 1~8, 그리드 상 위치 (고정)
  name: string; // 큰 목표. 자유 텍스트 (명사형이든 문장이든).
  // 색상 키(1~8). 심을 때는 비어 있고 slot 색을 씀. 사용자가 수정 화면에서 8색 중 고르면 채워짐.
  // 위치(slot)와 색을 분리한 것 - 자유 색상(컬러휠)은 아님, 튜닝된 팔레트 안에서만.
  colorKey?: number;
  branches: Branch[];
}

export interface Forest {
  id: string;
  year: number;
  theme: string | null;
  trees: Tree[];
}
