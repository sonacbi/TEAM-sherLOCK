import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useNavigationGuard(isDirty, setIsDirty, onConfirm) {
  const navigate = useNavigate();
  const ignorePop = useRef(false);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const handlePopState = () => {
      if (ignorePop.current) {
        ignorePop.current = false; // 한 번 무시 후 해제
        return;
      }

      if (!isDirty) return;

      const confirmLeave = window.confirm(
        "작업 내용이 초기화됩니다. 정말 이동하시겠습니까?"
      );

      if (confirmLeave) {
        setIsDirty(false);
        onConfirm?.();
        navigate(-1); // SPA 안전 이동
      } else {
        window.history.pushState(null, document.title); // 취소 시 화면 유지
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, setIsDirty, onConfirm, navigate]);

  // EXIT 버튼용 helper
  const exit = () => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "작업 내용이 초기화됩니다. 정말 이동하시겠습니까?"
      );
      if (!confirmLeave) return;
      setIsDirty(false);
      onConfirm?.();
    }

    ignorePop.current = true; // popstate 무시
    navigate(-1); // SPA 내부 이동
  };

  return { exit };
}
