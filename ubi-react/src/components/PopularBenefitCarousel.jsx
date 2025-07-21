import React from "react";
import { useNavigate } from "react-router-dom";
import usePopularBenefits from "../hook/welfareService/usePopularBenefits";
import { normalizeRegion } from "../utils/regionUtils";
import styles from "../styles/Carousel.module.css";

const PopularBenefitCarousel = () => {
  const { data: popularBenefits, loading } = usePopularBenefits();
  const navigate = useNavigate();

  const handleClick = (benefit) => {
    const { apiServiceId } = benefit;

    if (apiServiceId.startsWith("bokjiro-")) {
      const servId = apiServiceId.replace("bokjiro-", "");
      navigate(`/welfareDetail?servId=${servId}`);
    } else if (apiServiceId.startsWith("seoul-")) {
      navigate(`/seoulDetail?apiServiceId=${apiServiceId}`, {
        state: { data: benefit },
      });
    } else if (apiServiceId.startsWith("job-API")) {
      const servId = apiServiceId.replace(/^job-API[12]-/, "");
      navigate(`/facilityJobDetail?servId=${servId}`, {
        state: { data: benefit },
      });
    } else {
      alert("지원하지 않는 상세 데이터 유형입니다.");
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!popularBenefits.length) return <p>인기 혜택이 없습니다.</p>;

  return (
    <div className={styles.carouselWrapper}>
      {popularBenefits.map((b) => {
        const { regionCity, regionDistrict } = normalizeRegion(
          b.regionCity,
          b.regionDistrict
        );

        return (
          <article key={b.apiServiceId} className={styles.carouselCard}>
            <span className={styles.badge}>복지</span>
            <h4>{b.serviceName}</h4>
            <p>{b.category || "분류 없음"}</p>
            <p>
              <strong>
                {regionCity} {regionDistrict || "지역 정보 없음"}
              </strong>
            </p>
            <p>
              <strong>찜 {b.likeCount}회</strong>
            </p>
            <button
              className={styles.btnPrimary}
              onClick={() => handleClick(b)}
            >
              자세히 보기
            </button>
          </article>
        );
      })}
    </div>
  );
};

export default PopularBenefitCarousel;
