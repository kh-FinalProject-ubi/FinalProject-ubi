import React, { useState } from "react";
import usePopularBenefits from "../hook/welfareService/usePopularBenefits";
import { normalizeRegion } from "../utils/regionUtils";
import WelfareDetailModal from "./WelfareDetailModal"; // ✅ 모달 컴포넌트 import
import "../styles/Carousel.css";

const PopularBenefitCarousel = () => {
  const { data: popularBenefits, loading } = usePopularBenefits();
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchDetail = async (servId) => {
    if (!servId) return;
    const pureId = servId.replace("bokjiro-", ""); // ✅ bokjiro- 제거
    try {
      const res = await fetch(
        `/api/welfare-curl/welfare-detail?servId=${pureId}`
      );
      const data = await res.json();

      if (data?.detail?.resultCode === "40") {
        alert("해당 복지 혜택의 상세 정보가 없습니다.");
        return;
      }

      setSelectedDetail(data.detail);
    } catch (err) {
      console.error("❌ 상세 정보 불러오기 실패:", err);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!popularBenefits.length) return <p>인기 혜택이 없습니다.</p>;

  return (
    <div className="carousel-wrapper">
      {popularBenefits.map((b) => {
        const { regionCity, regionDistrict } = normalizeRegion(
          b.regionCity,
          b.regionDistrict
        );

        return (
          <article key={b.apiServiceId} className="carousel-card">
            <span className="badge">복지</span>
            <h4>{b.serviceName}</h4>
            <p>{b.category || "분류 없음"}</p>
            <p>
              📍 {regionCity} {regionDistrict || "지역 정보 없음"}
            </p>
            <p>🥇 찜 {b.likeCount}회</p>
            <button
              className="btn-primary"
              onClick={() => fetchDetail(b.apiServiceId)}
            >
              자세히 보기
            </button>
          </article>
        );
      })}

      {selectedDetail && (
        <WelfareDetailModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}
    </div>
  );
};

export default PopularBenefitCarousel;
