import React, { useState, useEffect } from "react";
import styles from "../../styles/WelfareSearchFilter.module.css";

const SERVICE_TYPES = [
  "전체",
  "일반",
  "노인",
  "청년",
  "아동",
  "장애인",
  "임산부",
];
const CATEGORIES = ["전체", "복지 혜택", "구인", "기타"];

const WelfareSearchFilter = ({ onFilterChange, fixedRegion }) => {
  const [filterState, setFilterState] = useState({
    keyword: "",
    serviceType: "전체",
    category: "전체",
    sortOrder: "latest",
    showAll: false,
  });

  useEffect(() => {
    onFilterChange({ ...filterState, region: fixedRegion });
  }, [filterState, fixedRegion, onFilterChange]);

  const updateFilter = (changes) =>
    setFilterState((prev) => ({ ...prev, ...changes }));

  return (
    <div className={styles.filterBox}>
      <h3 className={styles.filterTitle}>공공 서비스 조회</h3>

      {/* 🔍 검색창 + 정렬 버튼 */}
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="서비스 이름을 입력하세요"
          value={filterState.keyword}
          onChange={(e) => updateFilter({ keyword: e.target.value })}
        />
        <button
          className={styles.sortBtn}
          onClick={() =>
            updateFilter({
              sortOrder:
                filterState.sortOrder === "latest" ? "oldest" : "latest",
            })
          }
        >
          정렬 ▾ ({filterState.sortOrder === "latest" ? "최신순" : "오래된순"})
        </button>
      </div>

      {/* 🟡 필터 테이블 (좌측 노란 탭) */}
      <div className={styles.filterTable}>
        {/* 서비스 대상 행 */}
        <div className={styles.filterRow}>
          <div className={styles.filterLabel}>서비스 대상</div>
          <div className={styles.filterContent}>
            {SERVICE_TYPES.map((type) => (
              <label key={type} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="serviceType"
                  value={type}
                  checked={filterState.serviceType === type}
                  onChange={(e) =>
                    updateFilter({ serviceType: e.target.value })
                  }
                />
                <span className={styles.customRadio}></span>
                <span className={styles.radioText}>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 카테고리 행 */}
        <div className={styles.filterRow}>
          <div className={styles.filterLabel}>카테고리</div>
          <div className={styles.filterContent}>
            {CATEGORIES.map((type) => (
              <label key={type} className={styles.radioLabel}>
                <input
                  type="radio"
                  name="category"
                  value={type}
                  checked={filterState.category === type}
                  onChange={(e) => updateFilter({ category: e.target.value })}
                />
                <span className={styles.customRadio}></span>
                <span className={styles.radioText}>{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ 전체 혜택 보기 체크박스 */}
      <div className={styles.showAllToggle}>
        <label>
          <input
            type="checkbox"
            checked={filterState.showAll}
            onChange={() => updateFilter({ showAll: !filterState.showAll })}
          />
          전체 혜택 보기
        </label>
      </div>

      {/* ✅ 현재 선택 지역 정보 */}
      {fixedRegion && (
        <div className={styles.selectedRegionInfo}>
          현재 선택 지역:{" "}
          <strong>
            {fixedRegion.city} {fixedRegion.district}
          </strong>
        </div>
      )}
    </div>
  );
};

export default WelfareSearchFilter;
