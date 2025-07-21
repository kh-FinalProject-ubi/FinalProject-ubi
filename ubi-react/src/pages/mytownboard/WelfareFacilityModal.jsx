import React, { useState } from "react";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import { useSportsFacilities } from "../../hook/welfarefacility/useSportsFacilities";
import {
  getCombinedFacilities,
  getFilteredFacilities,
} from "../../utils/welfarefacilityMap";
import { normalizeRegion } from "../../utils/regionUtils";
import styles from "../../styles/board/MyTownModal.module.css";

export default function WelfareFacilityModal({
  city,
  district,
  onSelect,
  onClose,
}) {
  const [keyword, setKeyword] = useState("");
  const [serviceType, setServiceType] = useState("전체");

  const { regionCity: normCity, regionDistrict: normDistrict } =
    normalizeRegion(city, district);

  const {
    data: welfareData = [],
    loading: welfareLoading,
    error: welfareError,
  } = useFacilities("old", "전체", normCity, normDistrict);

  const {
    data: sportsData = [],
    loading: sportsLoading,
    error: sportsError,
  } = useSportsFacilities(normCity, normDistrict);

  const loading = welfareLoading || sportsLoading;
  const error = welfareError || sportsError;

  const combinedFacilities = getCombinedFacilities(
    "전체",
    welfareData,
    sportsData
  );
  const filteredFacilities = getFilteredFacilities({
    facilities: combinedFacilities,
    keyword,
    serviceType,
    category: "전체",
    selectedDistrict: normDistrict,
    selectedCity: normCity,
  });

  return (
    <div className={styles["modal-overlay"]}>
      <div className={styles["modal-container"]}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "20px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          ✖
        </button>

  <h2 className={styles["modal-title"]}>복지시설 선택</h2>
 

        <input
          type="text"
          placeholder="시설명 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={styles["search-input"]}
        />

        {loading && <p className={styles["loading-text"]}>불러오는 중...</p>}
        {error && (
          <p className={styles["error-text"]}>
            시설 데이터를 불러오는 데 실패했습니다.
          </p>
        )}
        {!loading && filteredFacilities.length === 0 && (
          <p className={styles["empty-text"]}>조건에 맞는 시설이 없습니다.</p>
        )}

        <ul className={styles["facility-list"]}>
          {filteredFacilities.map((facility, idx) => {
            const name =
              facility["FACLT_NM"] ||
              facility["facilityName"] ||
              facility["시설명"] ||
              "시설명 없음";
            const id =
              facility["serviceId"] ||
              facility["FACLT_ID"] ||
              facility["id"] ||
              facility["시설코드"] ||
              facility["SvcId"] ||
              facility["SVCID"] ||
              "ID 없음";
            const address =
              facility["address"] ||
              facility["ADDR"] ||
              facility["주소"] ||
              facility["refineRoadnmAddr"] ||
              "주소 없음";

            return (
<li
  key={`${name}-${id}-${idx}`}
  className={styles["facility-item"]}
  onClick={() => {
    onSelect({ name, id, address });
    onClose();
  }}
>
  <div className={styles["facility-info"]}>
    <div className={styles["region-label"]}>
      {normCity} {normDistrict}
    </div>
    <strong>{name}</strong>
    <small>주소: {address}</small>
  </div>
</li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
