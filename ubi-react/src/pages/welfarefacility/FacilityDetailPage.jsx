// 📁 src/pages/welfarefacility/FacilityDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import KakaoMapView from "../../components/welfarefacility/KakaoMapView";
import axios from "axios";
import "../../styles/welfarefacility/FacilityDetailPage.css";
import ReviewCarousel from "./ReviewCarousel";

function cleanDescription(desc) {
  return (
    desc
      .replace(/<!--\[data-hwpjson][\s\S]*?-->/g, "")
      .replace(/"{[^}]*}"/g, "")
      .replace(/([0-9]+)\.\s*/g, "\n$1. ")
      .replace(/\(([0-9]+)\)/g, "\n($1)")
      .replace(/- /g, "\n- ")
      .replace(/\u25BA/g, "\n►")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

export default function FacilityDetailPage() {
  const location = useLocation();
  const facility = location.state?.facility;

  const [relatedPosts, setRelatedPosts] = useState([]);

  const facilityServiceId =
    facility?.serviceId ||
    facility?.["serviceId"] ||
    facility?.["FACILITY_API_SERVICE_ID"] ||
    facility?.["SVCID"] ||
    null;

  useEffect(() => {
    if (facilityServiceId) {
      axios
        .get(`/api/board/mytownBoard/facility/${facilityServiceId}`)
        .then((res) => {
          console.log("📥 관련 게시글 응답:", res.data);
          setRelatedPosts(res.data);
        })
        .catch((err) => {
          console.error("❌ 게시글 목록 조회 실패:", err);
        });
    }
  }, [facilityServiceId]);

  if (!facility) {
    return <div>❌ 잘못된 접근입니다. 시설 정보가 없습니다.</div>;
  }

  const name =
    facility.facilityName ||
    facility["시설명"] ||
    facility["FACLT_NM"] ||
    "시설명 없음";

  const address =
    facility.facilityAddr ||
    facility["주소"] ||
    facility["REFINE_ROADNM_ADDR"] ||
    facility["ADDR"] ||
    facility["address"];

  const tel =
    facility.tel ||
    facility["전화번호"] ||
    facility["DETAIL_TELNO"] ||
    "없음";

  const imageUrl = facility.imageUrl || null;

  const lat =
    facility.lat ||
    facility.latitude ||
    facility["Y"] ||
    null;

  const lng =
    facility.lng ||
    facility.longitude ||
    facility["X"] ||
    null;

  const reservationUrl =
    facility.reservationUrl ||
    facility["SVCURL"] ||
    facility["HMPG_ADDR"];

  const phone =
    facility.phone ||
    facility["TELNO"] ||
    facility["DETAIL_TELNO"] ||
    facility["TEL"];

  const rawDescription = facility.description || facility["DTLCONT"] || "";
  const description = cleanDescription(rawDescription);

  const displayFields = {
    시설명: name,
    시설주소: address,
    카테고리: facility.category,
    예약주소: reservationUrl,
  };

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
          {Object.entries(displayFields).map(([label, value]) => (
            <li key={label}>
              <strong>{label}:</strong> {value || "없음"}
            </li>
          ))}
        </ul>
      </section>

      {description && (
        <section className="facility-section">
          <h3>📖 이용 안내</h3>
          <p style={{ whiteSpace: "pre-line" }}>{description}</p>
        </section>
      )}

      {(reservationUrl || phone) && (
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          {reservationUrl ? (
            <a
              href={reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reservation-button"
            >
              📅 예약하기
            </a>
          ) : (
            <button
              className="reservation-button"
              onClick={() => {
                if (phone) {
                  alert(`전화로 예약하세요: ${phone}`);
                }
              }}
            >
              📞 전화 예약하기
            </button>
          )}
        </div>
      )}

      <section className="facility-section">
        <h3>📍 시설 위치</h3>
        <KakaoMapView address={!lat ? address : null} lat={lat} lng={lng} />
      </section>

      {relatedPosts.length > 0 && (
        <section className="facility-section">
          <h3>📰 이 시설과 관련된 게시글</h3>
          <ReviewCarousel reviews={relatedPosts} />
        </section>
      )}
    </div>
  );
}
