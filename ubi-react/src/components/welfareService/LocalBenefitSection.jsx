import React from "react";
import "./LocalBenefitSection.css"; // 필요시 스타일 분리

// 목업 예시 (API 연동 시 props로 대체)
const mockBenefits = [
  {
    id: 1,
    title: "출산 가정 지원금",
    description: "출산 후 양육비 및 의료비 일부 지원",
    district: "서울특별시 강남구",
    tags: ["임산부", "영유아", "금전 지원"],
  },
  {
    id: 2,
    title: "장애인 교통비 지원",
    description: "대중교통 이용 시 이용료 일부 환급",
    district: "부산광역시",
    tags: ["장애인", "교통", "생활 지원"],
  },
];

const LocalBenefitSection = () => {
  return (
    <section className="local-benefit-section">
      <h3>🎁 지자체 복지 혜택</h3>
      <p>거주 지역을 기반으로 한 맞춤 복지 서비스를 확인해보세요.</p>

      <div className="benefit-card-list">
        {mockBenefits.map((benefit) => (
          <div key={benefit.id} className="benefit-card">
            <h4>{benefit.title}</h4>
            <p>{benefit.description}</p>
            <div className="benefit-meta">
              <span>{benefit.district}</span>
              <div className="tags">
                {benefit.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocalBenefitSection;
