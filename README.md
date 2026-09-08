# 하루시작 (harussijak)

목표를 씨앗으로 심고, 루틴을 실천하며 물을 주고, 시간이 지나며 나무로 성장해
숲을 이루는 목표관리 앱. 핵심은 "행동 자체"가 아니라 "행동의 이유(큰 목표)를
계속 상기시키는 것".

부담없이 시작, 죄책감 없이 재도전. 스트릭 개념 없음.

## 스택

- Vite + React + TypeScript
- Tailwind CSS v4
- 상태: React Context + localStorage (Supabase 연동 예정)

## 개발

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 타입체크 + 프로덕션 빌드
npm run lint     # oxlint
```

## 구조

- `src/lib/` — UI/DB 비의존 순수 함수·타입 (성장 계산, 날짜, 기록 집계 등).
  React Native 이전 시 그대로 재사용
- `src/store/` — ForestProvider (Context + localStorage)
- `src/pages/`, `src/components/` — 화면
- `supabase/schema.sql` — 예정 DB 스키마

자세한 기획·결정 사항은 `CLAUDE.md` 참고.
