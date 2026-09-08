import type { ReactNode } from "react";
import { useEffect } from "react";

// 화면 하단에서 올라오는 시트. 모달 대신 사용 (모바일 친화적).
// 브라우저 기본 alert/confirm은 쓰지 않음 - 톤/디자인 제어 불가 + 이벤트 블로킹.
export default function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(61, 56, 49, 0.28)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-t-[24px] bg-[var(--card)] px-4 pb-7 pt-3"
        style={{ boxShadow: "0 -10px 40px rgba(61, 56, 49, 0.16)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="mx-auto mb-4 h-1 w-9 rounded-full"
          style={{ background: "var(--border)" }}
          aria-hidden
        />
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
