import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * isDirty: 수정 중 상태
 * showModal: 모달 표시 state
 */
export default function useNavigationGuard(isDirty, setShowModal, onConfirm) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDirty) return;

    // ---------------------------
    // 1) 브라우저 새로고침/탭 닫기
    // ---------------------------
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // ---------------------------
    // 2) 뒤로가기 / 앞으로가기
    // ---------------------------
    const handlePopState = () => {
      if (isDirty) {
        const confirmLeave = window.confirm(
          "작업 내용이 초기화됩니다. 정말 이동하시겠습니까?"
        );
        if (confirmLeave) {
          // 이동 허용
          if (onConfirm) onConfirm();
        } else {
          // 이동 취소 → 뒤로가기를 막기 위해 push
          window.history.pushState(null, document.title);
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    // 처음에 pushState 한번 해두면 뒤로가기 방지 가능
    window.history.pushState(null, document.title);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isDirty, onConfirm, navigate]);
}
