// 로그인 상태의 Context 정의 + 소비 훅.
// Provider 구현은 auth.tsx. (fast-refresh 규칙상 컴포넌트 파일과 분리)

import { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;

  // 비밀번호 없이 이메일 링크로 로그인. 성공하면 error는 null.
  signInWithEmail(email: string): Promise<{ error: string | null }>;
  signOut(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
