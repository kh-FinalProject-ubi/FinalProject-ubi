import React, { useEffect, useState } from "react";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import { useSportsFacilities } from "../../hook/welfarefacility/useSportsFacilities";
import {
  getCombinedFacilities,
  getFilteredFacilities,
} from "../../utils/welfarefacilityMap";

import styles from "../../styles/welfarefacility/FacilitySearchPage.module.css"; // ✅ 모듈 CSS import

export default function FacilityListSection({ city, district }) {
  const [category, setCategory] = useState("전체");
  const [serviceType, setServiceType] = useState("전체");
  const [keyword, setKeyword] = useState("");

  const { data: welfareData = [], loading: welfareLoading } = useFacilities(
    "old",
    category,
    city,
    district
  );

  const { data: sportsData = [], loading: sportsLoading } =
    useSportsFacilities(city, district);

  const loading = welfareLoading || sportsLoading;

  const combinedFacilities = getCombinedFacilities(
    category,
    welfareData,
    sportsData
  );

  const filteredFacilities = getFilteredFacilities({
    facilities: combinedFacilities,
    keyword,
    serviceType,
    category,
    selectedCity: city,
    selectedDistrict: district,
  });

  if (loading) return <p>불러오는 중...</p>;

  return (
 <div className={styles["facility-card-list"]}>
        {filteredFacilities.map((facility, idx) => {
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
  );
}
