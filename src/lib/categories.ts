// 8칸(슬롯) 자체는 만다라트 구조상 고정이지만, 각 칸의 이름은 사용자가 자유롭게 정함.
// 아래 목록은 "이름 뭐로 할지 막막한 사람을 위한 추천 칩"일 뿐, 강제 값이 아님.
// 색은 이름과 무관하게 슬롯 위치(1~8)로 결정 -> 커스텀 이름이어도 항상 색이 정해짐.

export interface AreaSuggestion {
  label: string;
}

export const AREA_SUGGESTIONS: AreaSuggestion[] = [
  { label: "건강" },
  { label: "커리어" },
  { label: "여행" },
  { label: "돈" },
  { label: "관계" },
  { label: "취미" },
  { label: "자기계발" },
  { label: "기타" },
];

// 슬롯(1~8) 위치별 고정 색상 - 이름이 뭐든 그리드 상 위치에 따라 일관된 색을 가짐
export interface SlotColor {
  color: string;
  bg: string;
}

// 채도 낮춘 어스톤 8색 - 아이보리 배경 위에서 조화롭게, 서로 구분은 되게.
// color: 텍스트·버튼·아이콘 선에 쓰임(흰 글씨 올라가도 읽히게 충분히 어둡게).
// bg: 그 색의 아주 옅은 틴트(선택된 칸 배경, 연한 버튼 등).
const SLOT_COLORS: SlotColor[] = [
  { color: "#4F6343", bg: "#E8ECE0" }, // 1 이끼 초록
  { color: "#8C5540", bg: "#F1E5DD" }, // 2 테라코타
  { color: "#4E6475", bg: "#E4E9ED" }, // 3 흐린 슬레이트 블루
  { color: "#836A34", bg: "#F0E8D5" }, // 4 오커
  { color: "#7E5460", bg: "#EEE2E4" }, // 5 더스티 로즈
  { color: "#5F566F", bg: "#E8E5EC" }, // 6 헤더 퍼플
  { color: "#3F5B50", bg: "#E2EAE4" }, // 7 딥 파인
  { color: "#655C4C", bg: "#EBE6DD" }, // 8 웜 스톤
];

// slot: 1~8 (그리드에서 가운데를 제외한 위치)
export function getSlotColor(slot: number): SlotColor {
  return SLOT_COLORS[(slot - 1) % SLOT_COLORS.length];
}

// 팔레트 전체 (색상 선택 스와치용). 인덱스+1 이 colorKey.
export const SLOT_COLOR_LIST: SlotColor[] = SLOT_COLORS;

// 나무의 실제 색. colorKey를 골랐으면 그 색, 아니면 slot 색.
export function getTreeColor(tree: {
  slot: number;
  colorKey?: number | null;
}): SlotColor {
  return getSlotColor(tree.colorKey ?? tree.slot);
}
