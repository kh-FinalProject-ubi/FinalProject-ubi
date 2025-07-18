import React, { useRef, useEffect, useState } from "react";
import styles from "../../styles/comment/CommentModal.module.css";
import axios from "axios";

const CommentModal = ({ member, onClose, position, token, loadComments }) => {
  const modalRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const [isReporting, setIsReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [etcReason, setEtcReason] = useState("");
  const [hasReported, setHasReported] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  useEffect(() => {
    const checkReportStatus = async () => {
      try {
        const res = await axios.get(
          `/api/member/${member.memberNo}/report-status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const status = res.data;
        setHasReported(status === "Y");
      } catch (err) {
        console.error("신고 상태 확인 실패", err);
      }
    };
    if (token && member?.memberNo) checkReportStatus();
  }, [member?.memberNo, token]);

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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("신고가 철회되었습니다.");
      setHasReported(false);
      await loadComments();
      onClose();
    } catch (err) {
      console.error("신고 철회 실패:", err.response?.data || err.message);
      alert("신고 철회 실패");
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("신고가 접수되었습니다.");
      await loadComments();
      onClose();
    } catch (err) {
      console.error("신고 실패:", err.response?.data || err.message);
      alert("신고 실패");
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
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
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
              {hasReported ? (
                <button
                  className={`${styles.btnReport} ${styles.cancel}`}
                  onClick={handleCancelReport}
                >
                  신고 철회
                </button>
              ) : (
                <button
                  className={styles.btnReport}
                  onClick={() => setIsReporting(true)}
                >
                  신고하기 <img src="/report.svg" alt="신고" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CommentModal;
