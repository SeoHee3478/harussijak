import { useState } from "react";
import { useAuth } from "@/store/auth-context";

// 비밀번호 재설정 메일의 링크를 타고 들어왔을 때만 보이는 화면.
// (App.tsx가 passwordRecovery 상태를 보고 다른 화면 대신 이걸 띄움)
export default function ResetPasswordPage() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6 || sending) return;
    setSending(true);
    setError(null);
    const { error } = await updatePassword(password);
    setSending(false);
    if (error) setError(error);
    else setDone(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[400px] flex-col justify-center px-6">
      <h1 className="text-[28px] font-semibold leading-tight">하루씨작</h1>
      <p className="mt-1 mb-9 text-sm text-[var(--muted)]">
        새 비밀번호를 정해요
      </p>

      {done ? (
        <div>
          <p className="mb-4 text-base leading-relaxed text-[var(--muted)]">
            비밀번호를 바꿨어요.
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white"
            style={{ background: "var(--foreground)" }}
          >
            로그인하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="새 비밀번호 (6자 이상)"
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
            disabled={password.length < 6 || sending}
            className="w-full rounded-[var(--radius)] py-3.5 text-base font-medium text-white disabled:opacity-40"
            style={{ background: "var(--foreground)" }}
          >
            {sending ? "바꾸는 중…" : "비밀번호 바꾸기"}
          </button>
        </form>
      )}
    </main>
  );
}
