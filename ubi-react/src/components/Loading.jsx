// components/LoadingOverlay.jsx
import React from "react";
import styles from "../styles/LoadingOverlay.module.css";

const LoadingOverlay = ({ message = "잠시만 기다려주세요..." }) => (
  <div className={styles.loadingOverlay}>
    <div>{message}</div>
  </div>
);

export default LoadingOverlay;
