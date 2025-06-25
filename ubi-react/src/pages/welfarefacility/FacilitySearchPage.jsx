// 📁 src/pages/welfarefacility/FacilitySearchPage.jsx

import React, { useEffect, useState } from "react";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import useLoginMember from "../../hook/login/useLoginMember";
import "../../styles/welfarefacility/FacilitySearchPage.css";

export default function FacilitySearchPage() {
  const { member, loading: memberLoading } = useLoginMember();
  const {
    selectedCity: selectedCityFromStore,
    selectedDistrict: selectedDistrictFromStore,
  } = useSelectedRegionStore();

  const [region, setRegion] = useState({ city: "", district: "" });
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("전체");

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
    data: facilities,
    loading,
    error,
  } = useFacilities(region.city, region.district);

  const filteredFacilities = facilities.filter((f) => {
    const name = f["시설명"] || f["FACLT_NM"] || "";
    const type = f["시설종류명"] || f["SVC_TYPE"] || "";
    const matchesKeyword = keyword === "" || name.includes(keyword);
    const matchesCategory = category === "전체" || type.includes(category);
    return matchesKeyword && matchesCategory;
  });

  return (
    <div className="facility-search-container">
      <h2 className="facility-title">지역 복지시설</h2>

      {/* 🔍 필터 바 */}
      <div className="filter-bar">
        {/* 지역 표시 + 검색창 */}
        <div className="filter-row">
          <div className="region-text">
            {region.city} {region.district}
          </div>

          <input
            type="text"
            placeholder="시설명 검색"
            className="search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* 카테고리 라디오 필터 */}
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

      {/* 🔄 상태 처리 */}
      {loading && <p>불러오는 중...</p>}
      {error && (
        <p className="error-text">시설 정보를 가져오는 데 실패했습니다.</p>
      )}
      {!loading && filteredFacilities.length === 0 && (
        <p>해당 조건의 복지시설이 없습니다.</p>
      )}

      {/* 📋 카드 리스트 */}
      <div className="facility-card-list">
        {filteredFacilities.map((facility, idx) => {
          const key =
            facility["시설명"] ||
            facility["FACLT_NM"] ||
            `facility-${region.district}-${idx}`;
          return <FacilityCard key={key} facility={facility} />;
        })}
      </div>
    </div>
  );
}
