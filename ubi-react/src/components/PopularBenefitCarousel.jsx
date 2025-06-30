import React from "react";
import usePopularBenefits from "../hook/welfareService/usePopularBenefits";
import "../styles/Carousel.css";

const PopularBenefitCarousel = () => {
  const { data: popularBenefits, loading } = usePopularBenefits();

  if (loading) return <p>로딩 중...</p>;
  if (!popularBenefits.length) return <p>인기 혜택이 없습니다.</p>;

  return (
    <div className="carousel-wrapper">
      {popularBenefits.map((b, i) => (
        <article key={b.apiServiceId} className="carousel-card">
          <span className="badge">복지</span>
          <h4>{b.serviceName}</h4>
          <p>{b.category || "분류 없음"}</p>
          <p>🥇 찜 {b.likeCount}회</p>
          <button className="btn-primary">자세히 보기</button>
        </article>
      ))}
    </div>
  );
};

export default PopularBenefitCarousel;
