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
        {facilities.map((facility, index) => (
          <FacilityCard key={facility.FACLT_NM + index} facility={facility} />
        ))}
      </div>
    </div>
  );
}
