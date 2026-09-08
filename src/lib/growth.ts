// 🌱 나무 성장 계산 로직
// 대화에서 확정한 규칙:
// - 단발성(one_time) 가지: 완료되면 고정 포인트 부여 (반복 횟수 개념 없음)
// - 반복형(recurring) 가지: 누적 물주기 횟수만큼 포인트
// - 나무 전체 성장 = 모든 가지의 포인트 합산 후 구간 매핑
//
// 순수 함수로만 작성 - UI/DB에 의존하지 않음 -> 웹/RN 어디서든 그대로 재사용 가능

export type GrowthStage = "seed" | "sprout" | "tree" | "fruit";

export const GROWTH_LABELS: Record<GrowthStage, string> = {
  seed: "씨앗",
  sprout: "새싹",
  tree: "나무",
  fruit: "열매",
};

// 초기값 - 실사용 데이터 보고 조정 예정 (문서에도 명시된 대로)
const THRESHOLDS: { stage: GrowthStage; min: number }[] = [
  { stage: "fruit", min: 50 },
  { stage: "tree", min: 20 },
  { stage: "sprout", min: 5 },
  { stage: "seed", min: 0 },
];

const ONE_TIME_BRANCH_POINTS = 3;

export interface BranchGrowthInput {
  type: "one_time" | "recurring";
  isCompleted: boolean; // one_time: completed_at 존재 여부
  waterCount: number; // recurring: 누적 물주기 횟수 (one_time은 0)
}

export function branchPoints(branch: BranchGrowthInput): number {
  if (branch.type === "one_time") {
    return branch.isCompleted ? ONE_TIME_BRANCH_POINTS : 0;
  }
  return branch.waterCount;
}

export function stageFromPoints(points: number): GrowthStage {
  const found = THRESHOLDS.find((t) => points >= t.min);
  return found?.stage ?? "seed";
}

export function calculateTreeGrowth(branches: BranchGrowthInput[]): {
  stage: GrowthStage;
  points: number;
} {
  const points = branches.reduce((sum, b) => sum + branchPoints(b), 0);
  return { stage: stageFromPoints(points), points };
}

const STAGE_ORDER: GrowthStage[] = ["seed", "sprout", "tree", "fruit"];

export function nextStage(stage: GrowthStage): GrowthStage | null {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= 0 && idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1] : null;
}

// 다음 단계까지 남은 포인트 (자연어 안내에 사용: "나무가 되려면 물 12번쯤 더")
export function pointsToNextStage(points: number): number | null {
  const currentStage = stageFromPoints(points);
  const idx = STAGE_ORDER.indexOf(currentStage);
  if (idx === STAGE_ORDER.length - 1) return null; // 이미 최고 단계
  const next = THRESHOLDS.find((t) => t.stage === STAGE_ORDER[idx + 1]);
  return next ? Math.max(0, next.min - points) : null;
}

// 그래프/퍼센트 대신 문장으로 (CLAUDE.md: 자연어 + 시각적 은유, 막대·선 금지)
export function growthSentence(points: number): string {
  const stage = stageFromPoints(points);
  const next = nextStage(stage);
  const remaining = pointsToNextStage(points);
  if (!next || remaining == null) return "다 자란 나무예요";
  if (remaining === 0) return `곧 ${GROWTH_LABELS[next]} 단계로 넘어가요`;
  return `${GROWTH_LABELS[next]}까지 물 ${remaining}번쯤 더 주면 돼요`;
}
