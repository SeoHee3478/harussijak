import { useState } from "react";
import { useAuth } from "@/store/auth-context";

// 로그인 화면 - 이메일+비밀번호. (매직 링크는 Supabase 무료 플랜 기본 이메일 발송
// 제한 때문에 실사용이 어려워서 비밀번호 방식으로 변경함 - 이메일 발송 자체가 없음)
export default function LoginPage() {
  const { signIn, signUp, requestPasswordReset } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedUp, setSignedUp] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const canSubmit =
    mode === "reset"
      ? email.trim().length > 0
      : email.trim().length > 0 && password.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || sending) return;
    setSending(true);
    setError(null);

    if (mode === "reset") {
      const { error } = await requestPasswordReset(email.trim());
      setSending(false);
      if (error) setError(error);
      else setResetSent(true);
      return;
    }

    const { error } =
      mode === "signin"
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);
    setSending(false);
    if (error) setError(error);
    else if (mode === "signup") setSignedUp(true);
  }

  function switchMode(next: "signin" | "signup" | "reset") {
    setMode(next);
    setError(null);
    setResetSent(false);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[400px] flex-col justify-center px-6">
      <h1 className="text-[28px] font-semibold leading-tight">하루씨작</h1>
      <p className="mt-1 mb-9 text-sm text-[var(--muted)]">
        매일 씨앗 심듯, 오늘 물 한 번 주는 것에서 시작해요
      </p>

      {signedUp ? (
        <p className="text-base leading-relaxed text-[var(--muted)]">
          계정을 만들었어요. 이제 이 이메일과 비밀번호로 로그인해주세요.
        </p>
      ) : resetSent ? (
        <div>
          <p className="mb-4 text-base leading-relaxed text-[var(--muted)]">
            {email}로 비밀번호 재설정 링크를 보냈어요.
            <br />
            메일함에서 링크를 눌러주세요.
          </p>
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className="w-full text-center text-sm text-[var(--muted)] underline"
          >
            로그인으로 돌아가기
          </button>
        </div>
      ) : (
        <>
          <h2 className="mb-6 text-xl font-semibold leading-tight">
            {mode === "signin"
              ? "로그인해요"
              : mode === "signup"
                ? "계정을 만들어요"
                : "비밀번호를 재설정해요"}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              className="mb-2.5 w-full rounded-[var(--radius)] border px-3.5 py-3 text-base"
              style={{ borderColor: "var(--border)" }}
            />
            {mode !== "reset" && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 (6자 이상)"
                className="mb-3 w-full rounded-[var(--radius)] border px-3.5 py-3 text-base"
                style={{ borderColor: "var(--border)" }}
              />
            )}
            {error && (
              <p className="mb-3 text-sm" style={{ color: "#b23c3c" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={!canSubmit || sending}
              className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white disabled:opacity-40"
              style={{ background: "var(--foreground)" }}
            >
              {sending
                ? "확인하는 중…"
                : mode === "signin"
                  ? "로그인"
                  : mode === "signup"
                    ? "계정 만들기"
                    : "재설정 링크 보내기"}
            </button>

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => switchMode("reset")}
                className="mt-3 w-full text-center text-sm text-[var(--muted)] underline"
              >
                비밀번호를 잊으셨나요?
              </button>
            )}
            {mode === "reset" ? (
              <button
                type="button"
                onClick={() => switchMode("signin")}
                className="mt-3 w-full text-center text-sm text-[var(--muted)] underline"
              >
                로그인으로 돌아가기
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === "signup" ? "signin" : "signup")
                }
                className="mt-3 w-full text-center text-sm text-[var(--muted)] underline"
              >
                {mode === "signup"
                  ? "이미 계정이 있으신가요? 로그인"
                  : "계정이 없으신가요? 만들기"}
              </button>
            )}
          </form>
        </>
      )}
    </main>
  );
}
