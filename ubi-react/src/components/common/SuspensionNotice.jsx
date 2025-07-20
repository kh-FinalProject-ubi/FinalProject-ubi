import React, { useEffect } from "react";
import styles from "../styles/common/SuspensionNotice.module.css";

const SuspensionNotice = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000); // 10초 후 자동 닫기
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.noticeContainer}>
      <div className={styles.noticeBox}>
        <p>{message}</p>
        <button onClick={onClose}>확인</button>
      </div>
    </div>
  );
};

export default SuspensionNotice;
