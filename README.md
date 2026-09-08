# 숲 (Forest) - 목표 관리 앱

씨앗을 심고, 물을 주고, 숲을 만드는 목표 관리 서비스. (Vite + React + TypeScript)

## 시작하기

```bash
npm install
cp .env.example .env  # Supabase 키 채우기
npm run dev
```

## 구조

- `src/lib/growth.ts` — 나무 성장 계산 (순수 함수, RN 이전 시 그대로 재사용 가능)
- `src/lib/categories.ts` — 8개 고정 카테고리 설정 (색상/라벨)
- `src/lib/sample-data.ts` — Supabase 연동 전 화면 개발용 샘플 데이터
- `src/lib/supabase/` — Supabase 클라이언트
- `src/pages/` — 화면별 컴포넌트
- `supabase/schema.sql` — DB 스키마 (Supabase SQL Editor에 붙여넣고 실행)

## 구현된 화면

- `/today` — 오늘의 물주기 (C1)
- `/forest` — 전체 숲, 3x3 만다라트 그리드 (D2)
- `/new-tree` — 새 나무 심기, 카테고리 선택 (B1)

## 아직 안 만든 것

- Supabase 실제 연동 (지금은 샘플 데이터로 동작)
- 로그인/인증
- 나무 상세 화면(D1), 만다라트 입력(B2), 컴백 화면(C3) 등
- 배포: Vercel/Netlify에 연결하고 환경변수(.env 내용) 설정하면 바로 배포 가능
  (Vite 정적 빌드라 Vercel도 프레임워크 프리셋만 "Vite"로 선택하면 됨)
