import React from "react";
import styles from "../../styles/common/Modal.module.css";

export default function Modal({ children, onClose }) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.modalClose} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
