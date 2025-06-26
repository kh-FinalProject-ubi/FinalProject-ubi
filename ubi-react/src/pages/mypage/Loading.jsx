import React from "react";

const LoadingOverlay = ({ message = "불러오는 중입니다..." }) => (
  <div className="loading-overlay">
    <div>{message}</div>
  </div>
);

export default LoadingOverlay; 