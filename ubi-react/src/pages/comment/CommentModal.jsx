import React, { useRef, useEffect, useState } from "react";
import "../../styles/comment/CommentModal.css";
import axios from "axios";

const CommentModal = ({ member, onClose, position, token, loadComments }) => {
  const modalRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const [isReporting, setIsReporting] = useState(false); // 신고 모드 여부
  const [reason, setReason] = useState(""); // 신고 사유
  const [etcReason, setEtcReason] = useState(""); // 기타 사유
  const [hasReported, setHasReported] = useState(false); // 신고 여부 확인

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  // 신고 여부 받아오기
  useEffect(() => {
    const checkReportStatus = async () => {
      try {
        const res = await axios.get(
          `/api/member/${member.memberNo}/report-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // 상태 값: null | "Y" | "N"
        const status = res.data;
        setHasReported(status === "Y"); // Y일 경우에만 신고 철회 버튼 보여줌
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

  // 신고 철회 메서드
  const handleCancelReport = async () => {
    try {
      const res = await axios.post(
        `/api/member/${member.memberNo}/report`,
        { reason: "철회" }, // 서버에서 status = "Y"이면 자동으로 "N"으로 바꿔주는 구조니까, 이유는 아무거나 넣어도 됨
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("신고가 철회되었습니다.");
      setHasReported(false); // 버튼 상태 갱신

      try {
        await loadComments(); // 댓글 새로고침
      } catch (err) {
        console.error("댓글 다시 불러오기 실패:", err);
      }

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
      const res = await axios.post(
        `/api/member/${member.memberNo}/report`,
        { reason: finalReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("신고가 접수되었습니다.");

      try {
        await loadComments();
      } catch (err) {
        console.error("댓글 다시 불러오기 실패:", err);
      }

      onClose();
    } catch (err) {
      console.error("신고 실패:", err.response?.data || err.message);
      alert("신고 실패");
    }
  };

  const reportForm = (
    <div className="modal-report-form">
      <h3>신고 사유 선택</h3>
      <div>
        <label>
          <input
            type="radio"
            name="reason"
            value="욕설 및 비방"
            onChange={(e) => setReason(e.target.value)}
          />
          욕설 및 비방
        </label>
        <label>
          <input
            type="radio"
            name="reason"
            value="채팅 문제"
            onChange={(e) => setReason(e.target.value)}
          />
          채팅 문제
        </label>
        <label>
          <input
            type="radio"
            name="reason"
            value="스팸 또는 홍보"
            onChange={(e) => setReason(e.target.value)}
          />
          스팸 또는 홍보
        </label>
        <label>
          <input
            type="radio"
            name="reason"
            value="기타"
            onChange={(e) => setReason(e.target.value)}
          />
          기타
        </label>
        {reason === "기타" && (
          <textarea
            placeholder="기타 사유를 입력하세요"
            value={etcReason}
            onChange={(e) => setEtcReason(e.target.value)}
          />
        )}
      </div>
      <div className="modal-buttons">
        <button onClick={handleSubmitReport} className="btn-submit">
          신고 제출
        </button>
        <button onClick={() => setIsReporting(false)} className="btn-cancel">
          취소
        </button>
      </div>
    </div>
  );

  return (
    <div className="floating-modal-wrapper">
      <div
        className="floating-modal"
        onMouseDown={startDrag}
        ref={modalRef}
        style={{
          position: "fixed",
          top: `${position.y}px`,
          left: `${position.x}px`,
        }}
      >
        <button className="modal-close" onClick={onClose}>
          ×
        </button>

        {isReporting ? (
          reportForm
        ) : (
          <>
            <img
              src={
                `http://localhost:8080${member.memberImg}` ||
                "/default-profile.png"
              }
              alt="프로필"
              className="modal-profile-img"
            />
            <h3>{member?.memberNickname}</h3>
            <div className="modal-buttons">
              <button className="btn-chat">채팅하기</button>

              {hasReported ? (
                <button
                  className="btn-report cancel"
                  onClick={handleCancelReport}
                >
                  신고 철회
                </button>
              ) : (
                <button
                  className="btn-report"
                  onClick={() => setIsReporting(true)}
                >
                  신고하기
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
