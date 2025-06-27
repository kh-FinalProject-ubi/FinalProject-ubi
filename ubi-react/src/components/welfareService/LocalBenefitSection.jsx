import React, { useState } from "react";
import useLocalBenefitData from "../../hook/welfareService/useLocalBenefitData";
import useAuthStore from "../../stores/useAuthStore";
import WelfareSearchFilter from "./WelfareSearchFilter";
import { applyAllFilters } from "../../utils/applyAllFilters";
import "../../styles/LocalBenefitSection.css";

const LocalBenefitSection = () => {
  // ✅ 데이터 받아오기 (data를 benefits로 alias)
  const { data: benefits, loading, error } = useLocalBenefitData();

  // ✅ Zustand 상태 개별 구독으로 무한 루프 방지
  const token = useAuthStore((state) => state.token);
  const memberStandard = useAuthStore((state) => state.memberStandard);
  const regionCity = useAuthStore((state) => state.regionCity);
  const regionDistrict = useAuthStore((state) => state.regionDistrict);
  console.log("🧭 지역 정보:", regionCity, regionDistrict); // ✅ 꼭 찍어보기

  const authState = { token, memberStandard, regionCity, regionDistrict };

  // ✅ 사용자 필터 상태
  const [filterOptions, setFilterOptions] = useState({
    keyword: "",
    serviceType: "전체",
    category: "전체",
    sortOrder: "latest", // 향후 정렬 로직에도 활용 가능
    showAll: false, // '전체 보기' 전환에 활용
  });

  // ✅ 필터 적용
  const filteredData = applyAllFilters(benefits, filterOptions, authState);

  return (
    <section className="local-benefit-section">
      <h2 className="section-title">🎁 지역 복지 혜택 모음</h2>

      {/* ✅ 필터 컴포넌트 */}
      <WelfareSearchFilter onFilterChange={setFilterOptions} />

      {/* ✅ 로딩 & 에러 */}
      {loading && <p>로딩 중...</p>}
      {error && <p>데이터를 불러오는 데 실패했습니다.</p>}

      {/* ✅ 혜택 카드 목록 */}
      <div className="benefit-grid">
        {filteredData.map((item) => (
          <div className="benefit-card" key={item.id || item.title}>
            <div className="card-header">
              <h3>{item.title}</h3>
              <span className="category">{item.category}</span>
            </div>
            <p className="description">{item.description}</p>
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt="혜택 이미지"
                className="thumbnail"
              />
            )}
            <div className="card-footer">
              <p>
                {item.startDate} ~ {item.endDate}
              </p>
              <p className="region">{item.region}</p>
              {item.link && (
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  바로가기
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LocalBenefitSection;
