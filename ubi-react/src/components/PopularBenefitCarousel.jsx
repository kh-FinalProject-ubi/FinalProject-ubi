import React from "react";
import "../styles/Carousel.css";

const mock = Array.from({ length: 10 }).map((_, idx) => ({
  id: idx,
  title: `혜택명 ${idx + 1}`,
  desc: "혜택 설명 예시가 들어갑니다.",
}));

const PopularBenefitCarousel = () => (
  <div className="carousel-wrapper">
    {mock.map((b) => (
      <article key={b.id} className="carousel-card">
        <span className="badge">복지</span>
        <h4>{b.title}</h4>
        <p>{b.desc}</p>
        <button className="btn-primary">자세히 보기</button>
      </article>
    ))}
  </div>
);

export default PopularBenefitCarousel;
