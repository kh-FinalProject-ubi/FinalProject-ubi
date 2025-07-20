import React, { useRef, useEffect, useState } from "react";
import styles from "../../styles/comment/CommentModal.module.css";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

const CommentModal = ({ member, onClose, position, token  }) => {
  const modalRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // 댓글에서 받아올 필요 없고 토큰에서 뽑아오자
  const { authority } = useAuthStore();  
  const isAdmin = authority === "2";


  const [isReporting, setIsReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [etcReason, setEtcReason] = useState("");
  const [hasReported, setHasReported] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // 신고 / 정지 상태 확인 로직
  useEffect(() => {
    if (!token || !member?.memberNo) return;

    const checkStatus = async () => {
      // This logic now works correctly because isAdmin is properly defined.
      if (isAdmin) {
        try {
          const res = await axios.get(
            `/api/member/${member.memberNo}/suspend-status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsSuspended(res.data.suspended === "Y");
        } catch (err) {
          console.error("사용자 정지 상태 확인 실패", err);
        }
      } else {
        try {
          const res = await axios.get(
            `/api/member/${member.memberNo}/report-status`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setHasReported(res.data === "Y");
        } catch (err) {
          console.error("신고 상태 확인 실패", err);
        }
      }
    };

    checkStatus();
  }, [member?.memberNo, token, isAdmin]);

  const startDrag = (e) => {
    isDragging.current = true;
    offset.current = {
      x: e.clientX - modalRef.current.getBoundingClientRect().left,
      y: e.clientY - modalRef.current.getBoundingClientRect().top,
    };
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
  };

  const onDrag = (e) => {
    if (!isDragging.current) return;
    modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
    modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
  };

  const endDrag = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", endDrag);
  };

  const handleCancelReport = async () => {
    try {
      await axios.post(
        `/api/member/${member.memberNo}/report`,
        { reason: "철회" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
      alert("신고가 철회되었습니다.");
      setHasReported(false); 
      onClose();
    } catch (err) {
     
      console.error("신고 철회 실패:", err.response?.data || err.message);
      alert("신고 철회에 실패했습니다.");
    }
  };

   const handleSubmitReport = async () => {
    const finalReason = reason === "기타" ? etcReason : reason;
    if (!finalReason.trim()) {
      alert("신고 사유를 입력해주세요.");
      return;
    }
    try {
      await axios.post(
        `/api/member/${member.memberNo}/report`,
        { reason: finalReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("신고가 접수되었습니다.");
      setHasReported(true); 
      onClose();
    } catch (err) {
      console.error("신고 실패:", err.response?.data || err.message);
      alert("신고 접수에 실패했습니다.");
    }
  };
  
  const handleSuspendMember = async () => {
    if (!window.confirm(`${member.memberNickname}님을 정지 처리하시겠습니까?`)) return;
    try {
    
      await axios.post(
        `/api/member/${member.memberNo}/suspend`,
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("사용자가 정지 처리되었습니다.");
      setIsSuspended(true); 
      onClose();
    } catch (err) {
      console.error("사용자 정지 실패:", err.response?.data || err.message);
      alert("사용자 정지 처리에 실패했습니다.");
    }
  };
  
  const handleUnsuspendMember = async () => {
    if (!window.confirm(`${member.memberNickname}님의 정지를 해제하시겠습니까?`)) return;
    try {
      await axios.post(
        `/api/member/${member.memberNo}/suspend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("사용자 정지가 해제되었습니다.");
      setIsSuspended(false); 
      onClose();
    } catch (err) {
      console.error("사용자 정지 해제 실패:", err.response?.data || err.message);
      alert("사용자 정지 해제에 실패했습니다.");
    }
  };

  const reportForm = (
    <div className={styles.modalReportForm}>
      <h3>신고 사유 선택</h3>
      <label>
        <input
          type="radio"
          name="reason"
          value="욕설 및 비방"
          onChange={(e) => setReason(e.target.value)}
        />{" "}
        욕설 및 비방
      </label>
      <label>
        <input
          type="radio"
          name="reason"
          value="채팅 문제"
          onChange={(e) => setReason(e.target.value)}
        />{" "}
        채팅 문제
      </label>
      <label>
        <input
          type="radio"
          name="reason"
          value="스팸 또는 홍보"
          onChange={(e) => setReason(e.target.value)}
        />{" "}
        스팸 또는 홍보
      </label>
      <label>
        <input
          type="radio"
          name="reason"
          value="기타"
          onChange={(e) => setReason(e.target.value)}
        />{" "}
        기타
      </label>
      {reason === "기타" && (
        <textarea
          placeholder="기타 사유를 입력하세요"
          value={etcReason}
          onChange={(e) => setEtcReason(e.target.value)}
        />
      )}
      <div className={styles.modalButtonsRow}>
        <button onClick={handleSubmitReport} className={styles.btnSubmit}>
          신고 제출
        </button>
        <button
          onClick={() => setIsReporting(false)}
          className={styles.btnCancel}
        >
          취소
        </button>
      </div>
    </div>
  );

  const renderActionButtons = () => {
    if (isAdmin) {
      // Admin view
      return isSuspended ? (
        <button className={`${styles.btnReport} ${styles.cancel}`} onClick={handleUnsuspendMember}>
          정지 해제하기
        </button>
      ) : (
        <button className={styles.btnReport} onClick={handleSuspendMember}>
          정지하기 <img src="/report.svg" alt="신고" />
        </button>
      );
    } else {
      // Regular user view
      return hasReported ? (
        <button className={`${styles.btnReport} ${styles.cancel}`} onClick={handleCancelReport}>
          신고 철회
        </button>
      ) : (
        <button className={styles.btnReport} onClick={() => setIsReporting(true)}>
          신고하기 <img src="/report.svg" alt="신고" />
        </button>
      );
    }
  };

  return (
    <div className={styles.floatingModalWrapper}>
      <div
        className={styles.floatingModal}
        onMouseDown={startDrag}
        ref={modalRef}
        style={{
          position: "fixed",
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        <button className={styles.modalClose} onClick={onClose}>×</button>
        {isReporting ? (
          reportForm
        ) : (
          <>
            <img
              src={
                member.memberImg
                  ? `http://localhost:8080${member.memberImg}`
                  : "/default-profile.png"
              }
              alt="프로필"
              className={styles.modalProfileImg}
            />
            <h3>{member?.memberNickname}</h3>
            <div className={styles.modalButtons}>
              <button className={styles.btnChat}>1:1 채팅하기</button>
              {renderActionButtons()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentModal;

