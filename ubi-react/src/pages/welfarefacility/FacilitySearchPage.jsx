// 📁 src/pages/welfarefacility/FacilitySearchPage.jsx

import React, { useEffect, useState } from "react";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import useLoginMember from "../../hook/login/useLoginMember";
import "../../styles/welfarefacility/FacilitySearchPage.css";
import { useSportsFacilities } from "../../hook/welfarefacility/useSportsFacilities";

export default function FacilitySearchPage() {
  const { member, loading: memberLoading } = useLoginMember();
  const {
    selectedCity: selectedCityFromStore,
    selectedDistrict: selectedDistrictFromStore,
  } = useSelectedRegionStore();

  const [region, setRegion] = useState({ city: "", district: "" });
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("전체");
  const [serviceType, setServiceType] = useState("전체");

  const categoryMap = {
    체육시설: ["체육시설", "테니스장", "다목적경기장"],
    요양시설: ["재가노인복지시설", "노인요양시설", "장기요양기관"],
    의료시설: ["장애인재활치료시설", "정신건강복지 지역센터"],
    행정시설: [
      "건강가정지원센터",
      "다문화가족지원센터",
      "사회복지관",
      "자활시설",
    ],
  };

  const isMatchServiceTarget = (facility, selectedType) => {
    if (selectedType === "전체") return true;

    // 체육시설은 서비스 대상 필터 무시하고 항상 true
    if (facility["type"] === "체육" || facility["category"] === "체육시설") {
      return true;
    }

    const matchTable = {
      노인: ["노인"],
      청소년: ["청소년", "청년"],
      아동: ["아동"],
      장애인: ["장애인"],
    };

    const keywords = matchTable[selectedType] || [];
    const typeFields = [
      facility["시설종류명"],
      facility["상세유형"],
      facility["SVC_TYPE"],
      facility["category"],
      facility["type"],
    ];

    return keywords.some((keyword) =>
      typeFields.some((field) => field?.includes(keyword))
    );
  };

  useEffect(() => {
    if (!memberLoading) {
      const city =
        member?.memberAddressCity || selectedCityFromStore || "서울특별시";
      const district =
        member?.memberAddressDistrict || selectedDistrictFromStore || "종로구";
      setRegion({ city, district });
    }
  }, [member, memberLoading, selectedCityFromStore, selectedDistrictFromStore]);

  const {
    data: welfareData,
    loading: welfareLoading,
    error,
  } = useFacilities(region.city, region.district);

  const { data: sportsData, loading: sportsLoading } = useSportsFacilities(
    region.city,
    region.district
  );

  const loading = welfareLoading || sportsLoading;
  const combinedFacilities = [...welfareData, ...sportsData];

  const filteredFacilities = combinedFacilities.filter((f) => {
    const name =
      f["시설명"] ||
      f["FACLT_NM"] ||
      f["facilityName"] ||
      f["OPEN_FACLT_NM"] ||
      "";
    const type =
      f["상세유형"] || f["시설종류명"] || f["SVC_TYPE"] || f["category"] || "";

    const matchesKeyword = keyword === "" || name.includes(keyword);
    const matchesServiceType = isMatchServiceTarget(f, serviceType);
    const categoryKeywords = categoryMap[category] || [];
    const matchesCategory =
      category === "전체" ||
      categoryKeywords.some((target) => type?.includes(target));
    console.log(region);
    return matchesKeyword && matchesServiceType && matchesCategory;
  });

  return (
    <div className="facility-search-container">
      <h2 className="facility-title">지역 복지시설</h2>

      <div className="filter-bar">
        <div className="filter-row">
          <div className="region-text">
            {region.city?.split("^^^")[1] || region.city} {region.district}
          </div>

          <input
            type="text"
            placeholder="시설명 검색"
            className="search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="service-type-filter">
          {["전체", "노인", "청소년", "아동", "장애인"].map((type) => (
            <button
              key={type}
              onClick={() => setServiceType(type)}
              className={`service-btn ${
                serviceType === type ? "selected" : ""
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="category-filter">
          {["전체", "체육시설", "요양시설", "의료시설", "행정시설"].map(
            (cat) => (
              <label key={cat} className="radio-label">
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                />
                {cat}
              </label>
            )
          )}
        </div>
      </div>

      {loading && <p>불러오는 중...</p>}
      {error && (
        <p className="error-text">시설 정보를 가져오는 데 실패했습니다.</p>
      )}
      {!loading && filteredFacilities.length === 0 && (
        <p>해당 조건의 복지시설이 없습니다.</p>
      )}

      <div className="facility-card-list">
        {filteredFacilities.map((facility, idx) => {
          const name =
            facility["시설명"] ||
            facility["FACLT_NM"] ||
            facility["facilityName"] ||
            facility["OPEN_FACLT_NM"] ||
            "시설";
          const key = `${name}-${idx}`;
          return <FacilityCard key={key} facility={facility} />;
        })}
      </div>
    </div>
  );
}
