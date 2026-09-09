-- 🌱 목표 관리 앱 데이터베이스 스키마
-- 지금까지 대화에서 확정한 구조를 그대로 반영:
-- - forests: 연도별 숲 스냅샷
-- - trees: 카테고리당 최대 8개, 큰 목표
-- - branches: 나무당 최대 8개, 세부목표 (단발성/반복형)
-- - routines: 가지에 연결된 실행 루틴 (반복형 가지에만 해당)
-- - waterings: 실제 실행 기록 (단발성은 1회로 즉시 완료, 반복형은 누적)

-- 8칸(슬롯) 자체는 만다라트 구조상 고정이지만, 각 칸의 이름(area_label)은
-- 사용자가 자유롭게 정함 (앱에서는 "건강/커리어/..." 같은 예시를 추천 칩으로만 보여줌)
create type branch_type as enum ('one_time', 'recurring');

-- 연도별 숲 (숲 = 연도별 스냅샷)
create table forests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year int not null,
  theme text, -- 선택적 테마 한 줄 (예: "성장의 해")
  created_at timestamptz default now(),
  unique (user_id, year)
);

-- 나무 (큰 목표) - 숲당 슬롯(1~8)별 최대 1개, 즉 숲당 최대 8그루
-- name = 큰 목표 하나 (자유 텍스트, 명사형이든 문장이든). 예전 area_label 필드는 통합되어 사라짐.
create table trees (
  id uuid primary key default gen_random_uuid(),
  forest_id uuid references forests(id) on delete cascade not null,
  slot int not null check (slot >= 1 and slot <= 8), -- 3x3 그리드에서의 위치(중앙 제외 8칸)
  name text not null,
  color_key int, -- 튜닝된 8색 팔레트 중 선택(1~8). 비어있으면 slot 색을 씀.
  created_at timestamptz default now(),
  unique (forest_id, slot)
);

-- 가지 (세부목표) - 나무당 최대 8개
create table branches (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid references trees(id) on delete cascade not null,
  name text not null,
  type branch_type not null default 'recurring',
  completed_at timestamptz, -- 단발성 가지는 완료 시 이 값이 채워짐
  slot int not null check (slot >= 1 and slot <= 8), -- 3x3 그리드에서의 위치(중앙 제외 8칸)
  created_at timestamptz default now(),
  unique (tree_id, slot)
);

-- 루틴 (반복형 가지에 연결되는 실행 단위)
create table routines (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id) on delete cascade not null,
  name text not null,
  days int[] not null default '{0,1,2,3,4,5,6}', -- 물주기 대상 요일 (0=일 ~ 6=토). 전부면 매일.
  created_at timestamptz default now()
);

-- 물주기 기록 (실행 로그) - 나무 성장 계산의 기준
create table waterings (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid references routines(id) on delete cascade not null,
  watered_at timestamptz default now()
);

-- 마지막 접속일 (컴백 화면 트리거용)
create table user_activity (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_seen_at timestamptz default now()
);

-- Row Level Security: 자기 데이터만 접근 가능
alter table forests enable row level security;
alter table trees enable row level security;
alter table branches enable row level security;
alter table routines enable row level security;
alter table waterings enable row level security;
alter table user_activity enable row level security;

create policy "own forests" on forests for all using (auth.uid() = user_id);
create policy "own trees" on trees for all using (
  auth.uid() = (select user_id from forests where forests.id = trees.forest_id)
);
create policy "own branches" on branches for all using (
  auth.uid() = (select f.user_id from forests f join trees t on t.forest_id = f.id where t.id = branches.tree_id)
);
create policy "own routines" on routines for all using (
  auth.uid() = (
    select f.user_id from forests f
    join trees t on t.forest_id = f.id
    join branches b on b.tree_id = t.id
    where b.id = routines.branch_id
  )
);
create policy "own waterings" on waterings for all using (
  auth.uid() = (
    select f.user_id from forests f
    join trees t on t.forest_id = f.id
    join branches b on b.tree_id = t.id
    join routines r on r.branch_id = b.id
    where r.id = waterings.routine_id
  )
);
create policy "own activity" on user_activity for all using (auth.uid() = user_id);
