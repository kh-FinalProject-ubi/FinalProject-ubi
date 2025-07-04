import React from "react";
import { useNavigate } from "react-router-dom";
import usePopularBenefits from "../hook/welfareService/usePopularBenefits";
import { normalizeRegion } from "../utils/regionUtils";
import "../styles/Carousel.css";

const PopularBenefitCarousel = () => {
  const { data: popularBenefits, loading } = usePopularBenefits();
  const navigate = useNavigate();

  const handleClick = (benefit) => {
    const servId = benefit.apiServiceId.replace("bokjiro-", "");

    navigate(`/welfareDetail/${servId}`, {
      state: { data: benefit }, // ✅ 상세 페이지에서 받는 location.state.data
    });
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
            <button className="btn-primary" onClick={() => handleClick(b)}>
              자세히 보기
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default PopularBenefitCarousel;
