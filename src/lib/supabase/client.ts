import { createBrowserClient } from "@supabase/ssr";

// .env에 아래 두 값 설정 필요 (Supabase 프로젝트 생성 후 발급받음):
// VITE_SUPABASE_URL=
// VITE_SUPABASE_ANON_KEY=
export function createClient() {
  return createBrowserClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}
