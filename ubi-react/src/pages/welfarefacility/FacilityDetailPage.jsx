// 📁 src/pages/welfarefacility/FacilityDetailPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import useLoginMember from "../../hook/login/useLoginMember";

export default function FacilityDetailPage({ city, district }) {
  const { member, loading: memberLoading } = useLoginMember();
  const {
    selectedCity: selectedCityFromStore,
    selectedDistrict: selectedDistrictFromStore,
  } = useSelectedRegionStore();

  // ✅ 지역 상태 저장
  const [region, setRegion] = useState({
    city: "",
    district: "",
  });

  // ✅ 로그인 상태, 선택 상태에 따라 지역 설정
  useEffect(() => {
    if (!memberLoading) {
      // 로그인한 경우
      if (member) {
        const finalCity =
          member.memberAddressCity ||
          selectedCityFromStore ||
          city ||
          "서울특별시";
        const finalDistrict =
          member.memberAddressDistrict ||
          selectedDistrictFromStore ||
          district ||
          "종로구";

        console.log("✅ [로그인] 최종 지역:", finalCity, finalDistrict);
        setRegion({ city: finalCity, district: finalDistrict });
      } else {
        // 비로그인 또는 로그아웃된 경우
        const finalCity = selectedCityFromStore || city || "서울특별시";
        const finalDistrict = selectedDistrictFromStore || district || "종로구";

        console.log("✅ [비로그인] 최종 지역:", finalCity, finalDistrict);
        setRegion({ city: finalCity, district: finalDistrict });
      }
    }
  }, [
    member,
    memberLoading,
    selectedCityFromStore,
    selectedDistrictFromStore,
    city,
    district,
  ]);

  // ✅ 시설 데이터 가져오기
  const {
    data: facilities,
    loading,
    error,
  } = useFacilities(region.city, region.district);

  const [selectedServiceType, setSelectedServiceType] = useState("전체");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedOperator, setSelectedOperator] = useState("전체");

  // ✅ 필터 적용
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

  if (memberLoading || !region.city || !region.district) {
    return <p>로그인 정보를 불러오는 중입니다...</p>;
  }

  return (
    <div className="facility-detail-page">
      <h2>공공 서비스 조회</h2>

      <div style={{ marginBottom: "20px" }}>
        <strong>선택 지역:</strong> {region.city} {region.district}
      </div>

      {/* 필터 UI */}
      <div style={{ marginBottom: "30px" }}>
        <h3>정식 필터</h3>

        {/* 복지유형 */}
        <div>
          <label>
            <strong>복지 유형: </strong>
          </label>
          {["지자체 혜택", "지자체 시설"].map((type) => (
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

        {/* 카테고리 */}
        <div style={{ marginTop: "10px" }}>
          <label>
            <strong>카테고리: </strong>
          </label>
          {["복지 혜택", "구인", "예약", "기타"].map((cat) => (
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
          <br />
          {["체육시설", "요양시설", "의료시설", "행정시설", "집합시설"].map(
            (cat) => (
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
            )
          )}
        </div>

        {/* 운영기관 */}
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

      {/* 시설 카드 출력 */}
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
