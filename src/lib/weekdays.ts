// 요일 유틸 - UI/DB 비의존 순수 함수 (RN 이전 시 재사용)
// 0=일요일 ~ 6=토요일 (JS Date.getDay() 규칙)

export const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function todayWeekday(): number {
  return new Date().getDay();
}

export function isScheduledToday(days: number[]): boolean {
  return days.includes(todayWeekday());
}

// 요일 배열 → 사람이 읽는 문자열
export function formatDays(days: number[]): string {
  const s = [...new Set(days)].sort((a, b) => a - b);
  if (s.length === 0) return "요일 미설정";
  if (s.length === 7) return "매일";
  const isWeekend = s.length === 2 && s.includes(0) && s.includes(6);
  if (isWeekend) return "주말";
  const isWeekday =
    s.length === 5 && [1, 2, 3, 4, 5].every((d) => s.includes(d));
  if (isWeekday) return "평일";
  return s.map((d) => WEEKDAY_LABELS[d]).join("·");
}
