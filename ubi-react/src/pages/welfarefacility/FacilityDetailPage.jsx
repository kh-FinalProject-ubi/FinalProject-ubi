// 📁 src/pages/FacilityDetailPage.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import FacilityCard from "../../components/welfarefacility/FacilityCard";

export default function FacilityDetailPage() {
  const [searchParams] = useSearchParams();
  const city = searchParams.get("city");
  const district = searchParams.get("district");

  const { data: facilities, loading, error } = useFacilities(city, district);

  return (
    <div className="facility-detail-page">
      <h2>
        {city} {district} 복지시설 목록
      </h2>

      {loading && <p>로딩 중...</p>}
      {error && <p>시설 정보를 불러오는 중 오류가 발생했습니다.</p>}
      {!loading && facilities.length === 0 && <p>복지시설 정보가 없습니다.</p>}

      <div className="facility-list">
        {facilities.map((facility, index) => {
          const name = facility.FACLT_NM || facility["시설명"] || "이름없음";
          const lat = facility.REFINE_WGS84_LAT;
          const lng = facility.REFINE_WGS84_LOGT;
          const city = facility.CTPRVN_NM || facility["시도명"] || "시도없음";

          const key =
            lat && lng ? `${name}-${lat}-${lng}` : `${name}-${city}-${index}`; // <-- index 추가로 고유 보장

          return <FacilityCard key={key} facility={facility} />;
        })}
      </div>
    </div>
  );
}
