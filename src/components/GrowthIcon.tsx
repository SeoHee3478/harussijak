import type { GrowthStage } from "@/lib/growth";

// 성장 4단계 라인아트. 의인화(눈·표정) 금지 - 하고만다와의 핵심 차별점.
// 선은 슬롯색, 면은 같은 색의 옅은 워시. 단계별 실루엣 차이를 크게 둬서
// 작게 봐도 씨앗/새싹/나무/열매가 구분되게 함.
// 나중에 일러스트레이터 에셋으로 교체 시 이 컴포넌트만 갈아끼우면 됨.
export default function GrowthIcon({
  stage,
  color,
  size = 34,
}: {
  stage: GrowthStage;
  color: string;
  size?: number;
}) {
  const wash = color + "26"; // ~15% 불투명

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {stage === "seed" ? (
        // 흙 언덕에 반쯤 묻힌 씨앗 (아래쪽은 흙 속). 흙선이 씨앗을 가로지름.
        <>
          <path d="M9 31c2.5-1.4 6-2.2 11-2.2S28.5 29.6 31 31" />
          <path
            d="M20 24.5c3 0 5 2.4 5 5.4s-2 5.4-5 5.4-5-2.4-5-5.4 2-5.4 5-5.4Z"
            fill={wash}
          />
        </>
      ) : (
        /* 흙 - 새싹 이후 공통 */
        <path d="M8 32.5h24" />
      )}

      {stage === "sprout" && (
        <>
          <path d="M20 32.5V20" />
          <path d="M20 24.5c-4-.2-6.6-2.4-7-6.2 4-.5 6.8 1.3 7 6.2Z" fill={wash} />
          <path d="M20 21c3.3-.2 5.5-2 5.8-5.2-3.3-.4-5.6 1.1-5.8 5.2Z" fill={wash} />
        </>
      )}

      {stage === "tree" && (
        <>
          <path d="M20 32.5V17" />
          <path
            d="M20 6c5 1.8 8 5.4 8 9.6 0 4.4-3.4 7.4-8 7.4s-8-3-8-7.4C12 11.4 15 7.8 20 6Z"
            fill={wash}
          />
        </>
      )}

      {stage === "fruit" && (
        <>
          <path d="M20 32.5V16" />
          <ellipse cx="20" cy="13" rx="10.5" ry="9.5" fill={wash} />
          <circle cx="15.5" cy="12.5" r="1.9" fill={color} stroke="none" />
          <circle cx="24" cy="11" r="1.9" fill={color} stroke="none" />
          <circle cx="20" cy="16.5" r="1.9" fill={color} stroke="none" />
        </>
      )}
    </svg>
  );
}
