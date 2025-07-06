import React, { useRef, useEffect } from "react";
import "../../styles/comment/CommentModal.css"; // 필요 시 스타일 파일 따로 관리

const CommentModal = ({ member, onClose, position }) => {
  const modalRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

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

  return (
    <div className="floating-modal-wrapper">
      <div
  className="floating-modal"
  onMouseDown={startDrag}
  ref={modalRef}
  style={{
    position: "absolute",
    top: `${position.y}px`,
    left: `${position.x}px`,
  }}
>
        <button className="modal-close" onClick={onClose}>×</button>
        <img
          src={member?.memberImg || "/default-profile.png"}
          alt="프로필"
          className="modal-profile-img"
        />
        <h3>{member?.memberNickname}</h3>
        <div className="modal-buttons">
          <button className="btn-chat">채팅하기</button>
          <button className="btn-report">신고하기</button>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
