import React, { useEffect, useState } from "react";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import { useSportsFacilities } from "../../hook/welfarefacility/useSportsFacilities";
import {
  categoryMap,
  getCombinedFacilities,
  getFilteredFacilities,
} from "../../utils/welfarefacilityMap";
import { normalizeRegion } from "../../utils/regionUtils"; // ✅ 추가
import styles from "../../styles/welfarefacility/FacilitySearchPage.module.css";

export default function WelfareFacilityModal({
  city,
  district,
  onSelect,
  onClose,
}) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("전체");
  const [serviceType, setServiceType] = useState("전체");

  // ✅ 시군구 정규화 적용
  const { regionCity: normCity, regionDistrict: normDistrict } =
    normalizeRegion(city, district);

  const {
    data: welfareData = [],
    loading: welfareLoading,
    error,
  } = useFacilities("old", category, normCity, normDistrict); // ✅ 정규화된 값 사용

  const { data: sportsData = [], loading: sportsLoading } = useSportsFacilities(
    normCity,
    normDistrict // ✅ 동일하게 적용
  );

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
    selectedDistrict: normDistrict,
    selectedCity: normCity,
  });
  // ✅ 새로고침 트리거 추가
  useEffect(() => {
    if (!city || !district) {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }, [city, district]);

  return (
    <div className={styles["modal-overlay"]}>
      <div
        className={styles["modal-content"]}
        style={{ maxHeight: "80vh", overflowY: "auto", padding: "20px" }}
      >
        <h2 className={styles["modal-title"]}>
          복지시설 선택 (작성자 지역: {normCity} {normDistrict})
        </h2>
        <button onClick={onClose} className={styles["modal-close-btn"]}>
          ✖
        </button>

        {/* 필터바 */}
        <div className={styles["filter-bar"]}>
          <input
            type="text"
            placeholder="시설명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className={styles["search-input"]}
          />

          <div className={styles["service-type-filter"]}>
            {["전체", "노인", "청소년", "아동", "장애인"].map((type) => (
              <button
                key={type}
                onClick={() => setServiceType(type)}
                className={`${styles["service-btn"]} ${
                  serviceType === type ? styles["selected"] : ""
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className={styles["category-filter"]}>
            {["전체", "체육시설", "요양시설", "의료시설", "행정시설"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`${styles["service-btn"]} ${
                    category === cat ? styles["selected"] : ""
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        </div>

        {/* 결과 */}
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

            const mapToDisplayCategory = (rawType) => {
              return (
                Object.entries(categoryMap).find(([key, keywords]) =>
                  keywords.some((kw) => rawType?.includes(kw))
                )?.[0] || "기타"
              );
            };

            const rowcategory =
              facility["category"] ||
              facility["시설종류명"] ||
              facility["type"] ||
              "기타";
            const category = mapToDisplayCategory(rowcategory);

            const address =
              facility["address"] || facility["ADDR"] || facility["주소"] || "";

            return (
              <li
                key={`${name}-${id}-${idx}`}
                className={styles["facility-item"]}
                onClick={() => {
                  onSelect({ name, id, category, address });
                  onClose();
                }}
              >
                <strong>{name}</strong> <br />
                <small>카테고리: {category}</small> <br />
                <small>Service ID: {id}</small>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
