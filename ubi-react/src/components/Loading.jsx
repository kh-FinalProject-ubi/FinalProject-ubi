// components/LoadingOverlay.jsx
import React from 'react';
import '../styles/Loading.css';

const LoadingOverlay = ({ message = "잠시만 기다려주세요..." }) => (
  <div className="loading-overlay">
    <div>{message}</div>
  </div>
);

export default LoadingOverlay;