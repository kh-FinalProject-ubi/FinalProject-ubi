// 📁 src/pages/welfarefacility/FacilityDetailPage.jsx
import React, { useState } from "react";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";

export default function FacilityDetailPage({ city, district }) {
  const {
    selectedCity: selectedCityFromStore,
    selectedDistrict: selectedDistrictFromStore,
  } = useSelectedRegionStore();

  const finalCity = city || selectedCityFromStore || "서울특별시";
  const finalDistrict = district || selectedDistrictFromStore || "종로구";

  const [selectedServiceType, setSelectedServiceType] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedOperator, setSelectedOperator] = useState("전체");

  const {
    data: facilities,
    loading,
    error,
  } = useFacilities(finalCity, finalDistrict);

  const filteredFacilities = facilities.filter((facility) => {
    const svcType = facility["복지유형"] || facility.SVC_TYPE || "";
    const category = facility["카테고리"] || facility.CATEGORY || "";
    const operator = facility["운영기관"] || facility.OPERATOR || "";

    const typeMatch =
      selectedServiceType === "전체" || svcType.includes(selectedServiceType);
    const categoryMatch =
      selectedCategory === "전체" || category.includes(selectedCategory);
    const operatorMatch =
      selectedOperator === "전체" || operator.includes(selectedOperator);

    return typeMatch && categoryMatch && operatorMatch;
  });

  return (
    <div className="facility-detail-page">
      <h2>공공 서비스 조회</h2>

      {/* 선택 지역 표시 */}
      <div style={{ marginBottom: "20px" }}>
        <strong>선택 지역:</strong> {finalCity} {finalDistrict}
      </div>

      {/* 정식 필터 */}
      <div style={{ marginBottom: "30px" }}>
        <h3>정식 필터</h3>

        {/*  복지유형 (라디오) */}
        <div>
          <label>
            <strong>복지 유형: </strong>
          </label>
          {["전체", "주거", "의료", "상담", "여가"].map((type) => (
            <label key={type} style={{ marginRight: "10px" }}>
              <input
                type="radio"
                name="serviceType"
                value={type}
                checked={selectedServiceType === type}
                onChange={() => setSelectedServiceType(type)}
              />
              {type}
            </label>
          ))}
        </div>

        {/*  카테고리 (라디오) */}
        <div style={{ marginTop: "10px" }}>
          <label>
            <strong>카테고리: </strong>
          </label>
          {["전체", "노인", "아동", "여성", "장애인"].map((cat) => (
            <label key={cat} style={{ marginRight: "10px" }}>
              <input
                type="radio"
                name="category"
                value={cat}
                checked={selectedCategory === cat}
                onChange={() => setSelectedCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>

        {/*  운영기관 (select) */}
        <div style={{ marginTop: "10px" }}>
          <label>
            <strong>운영기관: </strong>
          </label>
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
          >
            <option value="전체">전체</option>
            <option value="시립">시립</option>
            <option value="구립">구립</option>
            <option value="민간">민간</option>
          </select>
        </div>
      </div>

      {/* 상태 메시지 */}
      {loading && <p>로딩 중...</p>}
      {error && <p>시설 정보를 불러오는 중 오류가 발생했습니다.</p>}
      {!loading && filteredFacilities.length === 0 && (
        <p>복지시설 정보가 없습니다. 추후 업데이트 예정입니다.</p>
      )}

      {/* 시설 카드 목록 */}
      <div className="facility-list">
        {filteredFacilities.map((facility, index) => {
          const name = facility.FACLT_NM || facility["시설명"] || "이름없음";
          const lat = facility.REFINE_WGS84_LAT;
          const lng = facility.REFINE_WGS84_LOGT;
          const city = facility.CTPRVN_NM || facility["시도명"] || "시도없음";

          const key =
            lat && lng ? `${name}-${lat}-${lng}` : `${name}-${city}-${index}`;

          return <FacilityCard key={key} facility={facility} />;
        })}
      </div>
    </div>
  );
}
