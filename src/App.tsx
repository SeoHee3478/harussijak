import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@/pages/HomePage";
import NewTreePage from "@/pages/NewTreePage";
import TreeDetailPage from "@/pages/TreeDetailPage";
import RecordPage from "@/pages/RecordPage";

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
