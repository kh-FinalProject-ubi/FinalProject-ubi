import React, { useState } from "react";
import useLocalBenefitData from "../../hook/welfareService/useLocalBenefitData";
import useAuthStore from "../../stores/useAuthStore";
import WelfareSearchFilter from "./WelfareSearchFilter";
import { applyAllFilters } from "../../utils/applyAllFilters";
import LikeButton from "../welfareLike/LikeButton";
import { useNavigate } from "react-router-dom";
import "../../styles/LocalBenefitSection.css";

const LocalBenefitSection = () => {
  const { data: benefits, loading, error } = useLocalBenefitData();

  const token = useAuthStore((state) => state.token);
  const memberStandard = useAuthStore((state) => state.memberStandard);
  const regionCity = useAuthStore((state) => state.regionCity);
  const regionDistrict = useAuthStore((state) => state.regionDistrict);

  // 초기값: 로그인 O → 토큰 정보 / 로그인 X → 기본값
  const [region, setRegion] = useState({
    city: token ? regionCityFromToken : "서울특별시",
    district: token ? regionDistrictFromToken : "종로구",
  });

  const authState = { token, memberStandard, regionCity, regionDistrict };
  const [filterOptions, setFilterOptions] = useState({
    keyword: "",
    serviceType: "전체",
    category: "전체",
    sortOrder: "latest",
    showAll: false,
  });

  const filteredData = Array.isArray(benefits)
    ? applyAllFilters(benefits, filterOptions, authState)
    : [];

  const navigate = useNavigate();

  return (
    <section className="local-benefit-section">
      <h2 className="section-title">🎁 지역 복지 혜택 모음</h2>
      <WelfareSearchFilter onFilterChange={setFilterOptions} />
      {loading && <p>로딩 중...</p>}
      {error && <p>데이터를 불러오는 데 실패했습니다.</p>}

      <div className="benefit-grid">
        {filteredData.length > 0
          ? filteredData.map((item) => (
              <div
                className="benefit-card"
                key={item.id || item.title}
                onClick={() =>
                  navigate("/welfareService/detail", { state: { data: item } })
                }
              >
                <div className="card-header">
                  <h3>{item.title}</h3>
                  <span className="category">{item.category}</span>
                </div>
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt="복지 이미지"
                    className="thumbnail"
                  />
                )}
                <p className="region">{item.region}</p>
                <p className="description">
                  {item.description?.slice(0, 80)}...
                </p>

                {/* 찜 버튼 (이벤트 전파 막기) */}
                <div
                  className="card-footer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LikeButton
                    apiServiceId={item.id}
                    serviceName={item.title}
                    category={item.category}
                    regionCity={item.regionCity}
                    regionDistrict={item.regionDistrict}
                    token={token}
                  />
                </div>
              </div>
            ))
          : !loading && <p>조건에 맞는 복지 혜택이 없습니다.</p>}
      </div>
    </section>
  );
};

export default LocalBenefitSection;
