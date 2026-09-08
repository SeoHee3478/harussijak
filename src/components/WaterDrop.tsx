// 물주기 표시용 물방울. 빈 외곽선 → 슬롯색으로 채워짐.
// 오늘의 물주기 목록과 나무 상세 패널에서 같은 아이콘을 씀 (디자인 통일).
// 클릭 처리는 부모가 함 (이건 순수 표시용).
export default function WaterDrop({
  filled,
  color,
  size = 24,
}: {
  filled: boolean;
  color: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 3.2c3.6 4.4 5.9 7.8 5.9 10.7a5.9 5.9 0 0 1-11.8 0C6.1 11 8.4 7.6 12 3.2Z"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      {filled && (
        <path
          d="M9.7 13.8c0 1.3.9 2.4 2.1 2.7"
          stroke="#fff"
          strokeOpacity={0.75}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
