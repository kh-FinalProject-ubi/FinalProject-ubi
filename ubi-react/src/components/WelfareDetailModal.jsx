import React from "react";
import styles from "../styles/WelfareDetailModal.module.css";

const WelfareDetailModal = ({ detail, onClose }) => {
  if (!detail) return null;

  const safe = (val) => val || "정보 없음";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          &times;
        </button>

        <h2>{safe(detail.servNm)}</h2>

        <p>
          <strong>제공 부서:</strong> {safe(detail.bizChrDeptNm)}
        </p>
        <p>
          <strong>지원 주기:</strong> {safe(detail.sprtCycNm)}
        </p>
        <p>
          <strong>지원 내용:</strong>{" "}
          {safe(detail.alwServCn || detail.servDgst)}
        </p>
        <p>
          <strong>신청 방법:</strong> {safe(detail.aplyMtdCn)}
        </p>
        <p>
          <strong>지원 대상:</strong> {safe(detail.sprtTrgtCn)}
        </p>
        <p>
          <strong>선정 기준:</strong> {safe(detail.slctCritCn)}
        </p>
        <p>
          <strong>관련 문의:</strong>
          <br />
          {Array.isArray(detail.inqplCtadrList) ? (
            detail.inqplCtadrList.map((item, idx) => (
              <div key={idx}>{safe(item.wlfareInfoReldCn)}</div>
            ))
          ) : (
            <span>{safe(detail.inqplCtadrList?.wlfareInfoReldCn)}</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default WelfareDetailModal;
