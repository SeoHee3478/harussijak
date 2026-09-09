import { useState } from "react";
import { useAuth } from "@/store/auth-context";

// 로그인 화면 - 비밀번호 없이 이메일로 받는 링크 하나로만 들어옴.
export default function LoginPage() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || sending) return;
    setSending(true);
    setError(null);
    const { error } = await signInWithEmail(email.trim());
    setSending(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[400px] flex-col justify-center px-6">
      <h1 className="text-[28px] font-semibold leading-tight">하루씨작</h1>
      <p className="mt-1 mb-9 text-sm text-[var(--muted)]">
        매일 씨앗 심듯, 오늘 물 한 번 주는 것에서 시작해요
      </p>
      <h2 className="mb-6 text-xl font-semibold leading-tight">
        이메일로 로그인해요
      </h2>

      {sent ? (
        <p className="text-base leading-relaxed text-[var(--muted)]">
          {email}로 로그인 링크를 보냈어요.
          <br />
          메일함에서 링크를 눌러주세요.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoFocus
            className="mb-3 w-full rounded-[var(--radius)] border px-3.5 py-3 text-base"
            style={{ borderColor: "var(--border)" }}
          />
          {error && (
            <p className="mb-3 text-sm" style={{ color: "#b23c3c" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!email.trim() || sending}
            className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white disabled:opacity-40"
            style={{ background: "var(--foreground)" }}
          >
            {sending ? "보내는 중…" : "로그인 링크 받기"}
          </button>
          <p className="mt-3 text-center text-sm leading-relaxed text-[var(--muted)]">
            비밀번호 없이 이메일로만 로그인해요
          </p>
        </form>
      )}
    </main>
  );
}
