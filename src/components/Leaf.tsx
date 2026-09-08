// 기록 화면용 작은 잎사귀. opacity로 진하기 조절.
export default function Leaf({
  size = 14,
  color = "var(--leaf)",
  opacity = 1,
}: {
  size?: number;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden>
      <path
        d="M13.5 2.5c.4 4-1 7-3.2 8.6-1.8 1.3-4.2 1.5-6.3.9-.5-2.1-.3-4.5 1-6.3C6.5 3.5 9.5 2.1 13.5 2.5Z"
        fill={color}
        opacity={opacity}
      />
      <path
        d="M4.5 12.5C6 9 8.7 6.3 12 4.8"
        stroke="var(--card)"
        strokeOpacity={opacity > 0.5 ? 0.5 : 0}
        strokeWidth={1}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
