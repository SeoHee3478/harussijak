// 로그인 상태의 Context 정의 + 소비 훅.
// Provider 구현은 auth.tsx. (fast-refresh 규칙상 컴포넌트 파일과 분리)

import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;

  // 이메일+비밀번호. 성공하면 error는 null.
  // (Supabase 무료 플랜 기본 이메일 발송이 시간당 몇 통으로 심하게 제한돼 있어서,
  // 매직 링크 대신 비밀번호 로그인으로 함 - "이메일 확인" 옵션을 꺼두면 메일 발송 자체가 없음)
  signIn(email: string, password: string): Promise<{ error: string | null }>;
  signUp(email: string, password: string): Promise<{ error: string | null }>;
  signOut(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
