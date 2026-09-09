import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/store/auth-context";
import { ForestProvider } from "@/store/forest";
import { useForest } from "@/store/forest-context";
import LoginPage from "@/pages/LoginPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import HomePage from "@/pages/HomePage";
import NewTreePage from "@/pages/NewTreePage";
import TreeDetailPage from "@/pages/TreeDetailPage";
import RecordPage from "@/pages/RecordPage";

function LoadingScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-1.5">
      <p className="text-base font-semibold">하루씨작</p>
      <p className="text-sm text-[var(--muted)]">불러오는 중…</p>
    </main>
  );
}

// 로그인된 뒤에만 숲 데이터를 불러오므로, 첫 로딩 동안은 라우트 대신 잠깐 대기 화면.
function ForestRoutes() {
  const { loading } = useForest();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/new-tree" element={<NewTreePage />} />
      <Route path="/tree/:id" element={<TreeDetailPage />} />
      <Route path="/record" element={<RecordPage />} />
      {/* 구 경로 호환 */}
      <Route path="/today" element={<Navigate to="/" replace />} />
      <Route path="/forest" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { user, loading, passwordRecovery } = useAuth();

  return (
    <BrowserRouter>
      {loading ? (
        <LoadingScreen />
      ) : passwordRecovery ? (
        <ResetPasswordPage />
      ) : !user ? (
        <Routes>
          <Route path="*" element={<LoginPage />} />
        </Routes>
      ) : (
        <ForestProvider>
          <ForestRoutes />
        </ForestProvider>
      )}
    </BrowserRouter>
  );
}
