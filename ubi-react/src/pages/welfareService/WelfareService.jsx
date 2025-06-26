import React from "react";
import WelfareSearchFilter from "../../components/welfareService/WelfareSearchFilter";
import LocalBenefitSection from "../../components/welfareService/LocalBenefitSection";

const WelfareService = () => {
  return (
    <div style={{ padding: "2rem" }}>
      <h2>공공복지 서비스</h2>
      <p>
        이 페이지는 정부 및 지자체에서 제공하는 다양한 복지 서비스를 안내하는
        공간입니다.
      </p>

      {/* 🔍 검색 및 필터 영역 */}
      <WelfareSearchFilter />

      {/* 🎁 지자체 혜택 카드 영역 */}
      <LocalBenefitSection />
    </div>
  );
};

export default WelfareService;
