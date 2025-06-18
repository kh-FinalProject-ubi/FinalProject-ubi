import React from "react";
import "./WelfareDetailModal.css";

const WelfareDetailModal = ({ detail, onClose }) => {
  if (!detail) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          &times;
        </button>
        <h2>{detail.servNm}</h2>
        <p>
          <strong>제공 부서:</strong> {detail.bizChrDeptNm}
        </p>
        <p>
          <strong>지원 주기:</strong> {detail.sprtCycNm}
        </p>
        <p>
          <strong>지원 내용:</strong> {detail.alwServCn || detail.servDgst}
        </p>
        <p>
          <strong>신청 방법:</strong> {detail.aplyMtdCn}
        </p>
        <p>
          <strong>지원 대상:</strong> {detail.sprtTrgtCn}
        </p>
        <p>
          <strong>선정 기준:</strong> {detail.slctCritCn}
        </p>
        <p>
          <strong>관련 문의:</strong> {detail.inqplCtadrList?.wlfareInfoReldCn}
        </p>
      </div>
    </div>
  );
};

export default WelfareDetailModal;
