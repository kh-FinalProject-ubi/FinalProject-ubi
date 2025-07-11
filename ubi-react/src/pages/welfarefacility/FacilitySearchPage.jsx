// 📁 src/pages/welfarefacility/FacilitySearchPage.jsx

import React, { useEffect, useState } from "react";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import useLoginMember from "../../hook/login/useLoginMember";
import "../../styles/welfarefacility/FacilitySearchPage.css";
import { useSportsFacilities } from "../../hook/welfarefacility/useSportsFacilities";
import Pagination from "../../components/Pagination";
import { extractRegionFromTaddress } from "../../utils/extractRegionFromTaddress";
import useAuthStore from "../../stores/useAuthStore";
import cityDistrictMap from "../../constants/cityDistrictMap";
import { normalizeRegion } from "../../utils/regionUtils";
import {
  getFilteredFacilities,
  getCombinedFacilities,
} from "../../utils/welfarefacilityMap"; // ✅ 공용 유틸 import

export default function FacilitySearchPage() {
  const { member, loading: memberLoading } = useLoginMember();
  const setAuth = useAuthStore((state) => state.setAuth);
  const auth = useAuthStore();

  useEffect(() => {
    if (member && !auth?.memberNo) {
      setAuth(member);
    }
  }, [member]);

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
  const [regionSource, setRegionSource] = useState("default");

  // ✅ 시도/시군구 정규화 반영 regionMap 생성
  const regionMap = {};
  Object.entries(cityDistrictMap).forEach(([rawCity, districts]) => {
    const { regionCity } = normalizeRegion(rawCity, "");
    if (!regionMap[regionCity]) regionMap[regionCity] = new Set();
    districts.forEach((district) => {
      const { regionDistrict } = normalizeRegion(regionCity, district);
      regionMap[regionCity].add(regionDistrict);
    });
  });
  Object.keys(regionMap).forEach((city) => {
    regionMap[city] = Array.from(regionMap[city]);
  });

  useEffect(() => {
    if (!memberLoading && regionSource === "default") {
      if (
        selectedCityFromStore &&
        selectedDistrictFromStore &&
        regionMap[selectedCityFromStore]
      ) {
        handleRegionSourceChange("map");
      } else if (member) {
        handleRegionSourceChange("my");
      } else {
        setSelectedCity("서울특별시");
        setAvailableDistricts(regionMap["서울특별시"]);
        setSelectedDistrict("종로구");
      }
      setRegionSource("initialized");
    }
  }, [memberLoading, member, selectedCityFromStore, selectedDistrictFromStore]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, selectedDistrict]);

  const handleRegionSourceChange = (source) => {
    setRegionSource(source);
    let city = "서울특별시";
    let district = "종로구";

    if (source === "my") {
      city = member?.regionCity || member?.tempRegionCity || city;
      district = member?.regionDistrict || member?.tempRegionDistrict || district;
    }

    if (source === "map") {
      city = selectedCityFromStore;
      district = selectedDistrictFromStore;
    }

    if (source === "bookmark") {
      const taddress = member?.memberTaddress;
      if (!taddress) return;
      const result = extractRegionFromTaddress(taddress);
      city = result.city;
      district = result.district;
    }

    if (city && district && regionMap[city]) {
  const { regionDistrict } = normalizeRegion(city, district); // ✅ 추가
  setSelectedCity(city);
  setAvailableDistricts(regionMap[city]);
  setSelectedDistrict(
    regionMap[city].includes(regionDistrict)
      ? regionDistrict
      : regionMap[city][0]
  );
}
  };

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

  // ✅ 공용 유틸로 병합
  const combinedFacilities = getCombinedFacilities(
    category,
    welfareData,
    sportsData
  );

  // ✅ 공용 유틸로 필터링
  const filteredFacilities = getFilteredFacilities({
    facilities: combinedFacilities,
    keyword,
    serviceType,
    category,
    selectedCity,
    selectedDistrict,
  });

  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const currentItems = filteredFacilities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="facility-search-container">
      <h2 className="facility-title">지역 복지시설</h2>

      <div className="region-source-buttons">
        <button
          onClick={() => handleRegionSourceChange("my")}
          className={regionSource === "my" ? "selected" : ""}
        >
          내 주소
        </button>
        <button
          onClick={() => handleRegionSourceChange("bookmark")}
          className={regionSource === "bookmark" ? "selected" : ""}
        >
          즐겨찾기 주소
        </button>
      </div>

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
