// 📁 src/pages/welfarefacility/FacilitySearchPage.jsx

import React, { useEffect, useState } from "react";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import useLoginMember from "../../hook/login/useLoginMember";
import "../../styles/welfarefacility/FacilitySearchPage.css";
import { useSportsFacilities } from "../../hook/welfarefacility/useSportsFacilities";
import Pagination from "../../components/Pagination";

export default function FacilitySearchPage() {
  const { member, loading: memberLoading } = useLoginMember();
  const {
    selectedCity: selectedCityFromStore,
    selectedDistrict: selectedDistrictFromStore,
  } = useSelectedRegionStore();

  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("전체");
  const [serviceType, setServiceType] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [selectedCity, setSelectedCity] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const regionMap = {
    서울특별시: [
      "종로구",
      "중구",
      "용산구",
      "성동구",
      "광진구",
      "동대문구",
      "중랑구",
      "성북구",
      "강북구",
      "도봉구",
      "노원구",
      "은평구",
      "서대문구",
      "마포구",
      "양천구",
      "강서구",
      "구로구",
      "금천구",
      "영등포구",
      "동작구",
      "관악구",
      "서초구",
      "강남구",
      "송파구",
      "강동구",
    ],
    경기도: [
      "수원시",
      "성남시",
      "고양시",
      "용인시",
      "부천시",
      "화성시",
      "남양주시",
      "안산시",
      "안양시",
      "평택시",
      "의정부시",
      "시흥시",
      "파주시",
      "김포시",
      "광명시",
      "군포시",
      "하남시",
      "오산시",
      "이천시",
      "안성시",
      "구리시",
      "포천시",
      "의왕시",
      "여주시",
      "양평군",
    ],
    강원특별자치도: [
      "춘천시",
      "원주시",
      "강릉시",
      "동해시",
      "태백시",
      "속초시",
      "삼척시",
      "홍천군",
      "횡성군",
      "영월군",
      "평창군",
      "정선군",
      "철원군",
      "화천군",
      "양구군",
      "인제군",
      "고성군",
      "양양군",
    ],
    부산광역시: [
      "중구",
      "서구",
      "동구",
      "영도구",
      "부산진구",
      "동래구",
      "남구",
      "북구",
      "해운대구",
      "사하구",
      "금정구",
      "강서구",
      "연제구",
      "수영구",
      "사상구",
      "기장군",
    ],
  };

  useEffect(() => {
    if (!memberLoading) {
      const fallbackCity = "서울특별시";
      const fallbackDistrict = "종로구";

      const city =
        member?.memberAddressCity || selectedCityFromStore || fallbackCity;
      const district =
        member?.memberAddressDistrict ||
        selectedDistrictFromStore ||
        fallbackDistrict;

      setSelectedCity(city);
      setAvailableDistricts(regionMap[city] || []);
      setSelectedDistrict(
        regionMap[city]?.includes(district)
          ? district
          : regionMap[city]?.[0] || fallbackDistrict
      );
    }
  }, [member, memberLoading, selectedCityFromStore, selectedDistrictFromStore]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedDistrict]);

  // ✅ 주요 데이터 fetch
  const {
    data: welfareData = [],
    loading: welfareLoading,
    error,
  } = useFacilities("old", category, selectedCity, selectedDistrict);

  const { data: sportsData = [], loading: sportsLoading } = useSportsFacilities(
    selectedCity,
    selectedDistrict
  );

  const loading = welfareLoading || sportsLoading;

  // ✅ 디버깅 로그
  console.log("🔥 selectedCity:", selectedCity);
  console.log("🔥 selectedDistrict:", selectedDistrict);
  console.log("🔥 welfareData:", welfareData);
  console.log("🔥 sportsData:", sportsData);

  // ✅ 안전한 병합 처리
  const combinedFacilities = [
    ...(Array.isArray(welfareData) ? welfareData : []),
    ...(Array.isArray(sportsData) ? sportsData : []),
  ];

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
    if (facility["type"] === "체육" || facility["category"] === "체육시설")
      return true;

    const matchTable = {
      노인: ["노인", "요양"],
      청소년: ["청소년", "청년", "쉼터"],
      아동: ["아동", "유아", "보육"],
      장애인: ["장애인", "발달장애", "지체장애"],
    };

    const keywords = matchTable[selectedType] || [];

    const typeFields = [
      facility["시설명"],
      facility["facilityName"],
      facility["FACLT_NM"],
      facility["OPEN_FACLT_NM"],
      facility["시설종류명"],
      facility["시설종류상세명"],
      facility["상세유형"],
      facility["SVC_TYPE"],
      facility["category"],
      facility["type"],
    ];

    return keywords.some((keyword) =>
      typeFields.some((field) => field?.includes?.(keyword))
    );
  };

  const filteredFacilities = combinedFacilities.filter((f) => {
    const name =
      f["facilityName"] ||
      f["시설명"] ||
      f["FACLT_NM"] ||
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

    return matchesKeyword && matchesServiceType && matchesCategory;
  });

  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const currentItems = filteredFacilities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="facility-search-container">
      <h2 className="facility-title">지역 복지시설</h2>

      {/* 필터 영역 */}
      <div className="filter-bar">
        <div className="filter-row">
          <div className="region-select-row">
            <select
              value={selectedCity}
              onChange={(e) => {
                const city = e.target.value;
                setSelectedCity(city);
                setAvailableDistricts(regionMap[city] || []);
                setSelectedDistrict(regionMap[city]?.[0] || "");
              }}
            >
              <option value="">시도 선택</option>
              {Object.keys(regionMap).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={!selectedCity}
            >
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
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
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`service-btn ${category === cat ? "selected" : ""}`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* 출력 영역 */}
      {loading && <p>불러오는 중...</p>}
      {error && (
        <p className="error-text">시설 정보를 가져오는 데 실패했습니다.</p>
      )}
      {!loading && filteredFacilities.length === 0 && (
        <p>해당 조건의 복지시설이 없습니다.</p>
      )}

      <div className="facility-card-list">
        {currentItems.map((facility, idx) => {
          const name =
            facility["facilityName"] ||
            facility["시설명"] ||
            facility["FACLT_NM"] ||
            facility["OPEN_FACLT_NM"] ||
            "시설";
          const key = `${name}-${idx}`;
          return <FacilityCard key={key} facility={facility} />;
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
