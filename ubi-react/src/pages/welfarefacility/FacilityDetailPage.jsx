// 📁 src/pages/welfarefacility/FacilityDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import KakaoMapView from "../../components/welfarefacility/KakaoMapView"; // 카카오맵 컴포넌트
import "../../styles/welfarefacility/FacilityDetailPage.css";

export default function FacilityDetailPage() {
  const location = useLocation();
  const facility = location.state?.facility;

  if (!facility) {
    return <div>❌ 잘못된 접근입니다. 시설 정보가 없습니다.</div>;
  }

  const name = facility["시설명"] || facility["FACLT_NM"] || "시설명 없음";
  const address =
    facility["주소"] || facility["REFINE_ROADNM_ADDR"] || facility["ADDR"];
  const imageUrl = facility.imageUrl || null;

  return (
    <div className="facility-detail-container">
      <h2 className="facility-detail-title">{name}</h2>

      {imageUrl && (
        <div className="facility-image">
          <img src={imageUrl} alt="시설 이미지" />
        </div>
      )}

      <section className="facility-section">
        <h3>📝 상세 정보</h3>
        <ul>
          {Object.entries(facility).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value || "없음"}
            </li>
          ))}
        </ul>
      </section>

      <section className="facility-section">
        <h3>📍 시설 위치</h3>
        <KakaoMapView address={address} />
      </section>
    </div>
  );
}
