// 날짜 유틸 - UI/DB에 의존하지 않는 순수 함수 (RN 이전 시 그대로 재사용)

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ISO 문자열이 "오늘"인지. null이면 false.
export function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return isSameDay(new Date(iso), new Date());
}

// 로컬 기준 YYYY-MM-DD 키 (기록 집계용)
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// n일 전 자정 ~ 오늘까지의 Date 배열 (오래된 것부터)
export function lastNDays(n: number): Date[] {
  const out: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}
