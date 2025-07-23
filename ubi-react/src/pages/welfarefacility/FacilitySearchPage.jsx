// 📁 src/pages/welfarefacility/FacilitySearchPage.jsx

import React, { useEffect, useState } from "react";
import FacilityCard from "../../components/welfarefacility/FacilityCard";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import useLoginMember from "../../hook/login/useLoginMember";
import styles from "../../styles/welfarefacility/FacilitySearchPage.module.css";

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
import { useNavigate, useLocation } from "react-router-dom";

export default function FacilitySearchPage() {
  const { member, loading: memberLoading, refetchMember } = useLoginMember();
  const location = useLocation(); // 🔑 location 필요!

  const setAuth = useAuthStore((state) => state.setAuth);
  const auth = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.refresh === "memberUpdate") {
      (async () => {
        console.log("🌀 내정보에서 갱신됨, refetchMember 호출");
        await refetchMember?.(); // ✅ member가 최신화된 이후
        handleRegionSourceChange("my"); // 또는 "bookmark"
      })();
    }
  }, [location.state]);

  const {
    setSelectedCity: setCityInStore,
    setSelectedDistrict: setDistrictInStore,
  } = useSelectedRegionStore();

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
  const itemsPerPage = 24;

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
    if (location.state?.refresh === "memberUpdate") {
      (async () => {
        await refetchMember?.(); // 최신 회원정보로 업데이트
        handleRegionSourceChange("bookmark"); // 즐겨찾기 주소로 지역 변경
      })();
    }
  }, [location.state]);

  useEffect(() => {
    console.log("🚀 memberLoading:", memberLoading);
    console.log("🧑‍💼 member:", member);
    console.log("🗺️ selectedCityFromStore:", selectedCityFromStore);
    console.log("🏷️ regionSource:", regionSource);

    if (!memberLoading && regionSource === "default") {
      if (
        selectedCityFromStore &&
        selectedDistrictFromStore &&
        regionMap[selectedCityFromStore]
      ) {
        console.log("📌 map 지역으로 초기화");
        handleRegionSourceChange("map");
      } else if (member) {
        console.log("📌 내 주소로 초기화");
        handleRegionSourceChange("my");
      } else {
        console.log("📌 기본 서울/종로 초기화");
        setSelectedCity("서울특별시");
        setAvailableDistricts(regionMap["서울특별시"]);
        setSelectedDistrict("종로구");
      }
      setRegionSource("initialized");
    }
  }, [memberLoading, member, selectedCityFromStore, selectedDistrictFromStore]);

  const handleRegionSourceChange = (source) => {
    setRegionSource(source);
    let city = "서울특별시";
    let district = "종로구";

    if (source === "my") {
      console.log("🔍 내 주소:", member?.regionCity, member?.regionDistrict);
      city = member?.regionCity || member?.tempRegionCity || city;
      district =
        member?.regionDistrict || member?.tempRegionDistrict || district;
    }

    if (source === "map") {
      city = selectedCityFromStore;
      district = selectedDistrictFromStore;
    }

    if (source === "bookmark") {
      const taddress = member?.memberTaddress;

      console.log("📍 즐겨찾기 주소:", taddress); // ✅ 1. 원본 주소 확인

      if (!taddress) {
        console.warn("❗ 즐겨찾기 주소 없음");
        return;
      }

      const result = extractRegionFromTaddress(taddress);

      console.log("➡️ 추출된 지역:", result); // ✅ 2. 추출된 시/도, 시/군/구

      console.log("🧭 regionMap keys:", Object.keys(regionMap)); // ✅ 3. 전체 시도 목록
      console.log("✔️ result.city in regionMap?", regionMap[result.city]); // ✅ 4. 포함 여부 확인

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

      // ✅ 전역 상태 store에도 반영 (Header용)
      setCityInStore(city);
      setDistrictInStore(
        regionMap[city].includes(regionDistrict)
          ? regionDistrict
          : regionMap[city][0]
      );
      navigate(
        `/facility/search?city=${encodeURIComponent(
          city
        )}&district=${encodeURIComponent(district)}`
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
    <div className={styles["facility-search-container"]}>
      <h2 className={styles["facility-title"]}>지역 복지시설</h2>

      <div className={styles["region-source-buttons"]}>
        <button
          onClick={() => handleRegionSourceChange("my")}
          className={regionSource === "my" ? styles.selected : ""}
        >
          내 주소
        </button>
        <button
          onClick={() => handleRegionSourceChange("bookmark")}
          className={regionSource === "bookmark" ? styles.selected : ""}
        >
          즐겨찾기 주소
        </button>
      </div>

      <div className={styles["filter-bar"]}>
        <div className={styles["filter-row"]}>
          <div className={styles["region-select-row"]}>
            {/* 시/도 선택 */}
            <select
              value={selectedCity}
              onChange={(e) => {
                const city = e.target.value;
                const firstDistrict = regionMap[city]?.[0] || "";

                setSelectedCity(city);
                setCityInStore(city);
                setAvailableDistricts(regionMap[city] || []);
                setSelectedDistrict(firstDistrict);
                setDistrictInStore(firstDistrict);

                // ✅ URL 업데이트
                navigate(
                  `/facility/search?city=${encodeURIComponent(
                    city
                  )}&district=${encodeURIComponent(firstDistrict)}`
                );
              }}
            >
              <option value="">시도 선택</option>
              {Object.keys(regionMap).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {/* 시군구 선택 */}
            <select
              value={selectedDistrict}
              onChange={(e) => {
                const district = e.target.value;
                setSelectedDistrict(district);
                setDistrictInStore(district);

                // ✅ URL 업데이트
                navigate(
                  `/facility/search?city=${encodeURIComponent(
                    selectedCity
                  )}&district=${encodeURIComponent(district)}`
                );
              }}
              disabled={!selectedCity}
            >
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className={styles["search-wrapper"]}>
            <svg className={styles["search-icon"]} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3Z"
              />
            </svg>
            <input
              type="text"
              placeholder="시설명 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterContainer}>
          <h3 className={styles.filterTitle}>검색 필터</h3>
          <div className={styles.filterBox}>
            <table className={styles.filterTable}>
              <tbody>
                {/* 서비스 대상 필터 */}
                <tr className={styles.filterRow}>
                  <th className={styles.filterLabel}>서비스 대상</th>
                  <td className={styles.filterContent}>
                    {["전체", "노인", "청소년", "아동", "장애인"].map(
                      (type) => (
                        <label key={type} className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="serviceType"
                            value={type}
                            checked={serviceType === type}
                            onChange={(e) => setServiceType(e.target.value)}
                          />
                          <span className={styles.customRadio}></span>
                          <span className={styles.radioText}>{type}</span>
                        </label>
                      )
                    )}
                  </td>
                </tr>

                {/* 시설 종류 필터 */}
                <tr className={styles.filterRow}>
                  <th className={styles.filterLabel}>시설 종류</th>
                  <td className={styles.filterContent}>
                    {[
                      "전체",
                      "체육시설",
                      "요양시설",
                      "의료시설",
                      "행정시설",
                    ].map((cat) => (
                      <label key={cat} className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="category"
                          value={cat}
                          checked={category === cat}
                          onChange={(e) => setCategory(e.target.value)}
                        />
                        <span className={styles.customRadio}></span>
                        <span className={styles.radioText}>{cat}</span>
                      </label>
                    ))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles["facility-status"]}>
        {loading && <p className={styles["loading-text"]}>불러오는 중...</p>}

        {error && (
          <p className={styles["error-text"]}>
            시설 정보를 가져오는 데 실패했습니다.
          </p>
        )}

        {!loading && !error && filteredFacilities.length === 0 && (
          <p className={styles["empty-text"]}>
            해당 조건의 복지시설이 없습니다.
          </p>
        )}
      </div>

      <div className={styles["facility-card-list"]}>
        {currentItems.map((facility, idx) => {
          const name =
            facility["facilityName"] ||
            facility["시설명"] ||
            facility["FACLT_NM"] ||
            facility["OPEN_FACLT_NM"] ||
            "시설";
          const key = `${name}-${idx}`;
          return (
            <FacilityCard
              key={key}
              facility={facility}
              selectedCity={selectedCity}
              selectedDistrict={selectedDistrict}
            />
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            // window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
}
