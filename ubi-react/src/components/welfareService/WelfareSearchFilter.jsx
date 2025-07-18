import React, { useState, useEffect } from "react";
import styles from "../../styles/WelfareSearchFilter.module.css"; // 🌟 모듈 import

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

  /* ---------- 외부로 상태 전달 ---------- */
  useEffect(() => {
    onFilterChange({ ...filterState, region: fixedRegion });
  }, [filterState, fixedRegion, onFilterChange]);

  const updateFilter = (changes) =>
    setFilterState((prev) => ({ ...prev, ...changes }));

  /* ---------- UI ---------- */
  return (
    <div className={styles["welfare-search-filter"]}>
      <h3 className={styles.title}>공공 서비스 조회</h3>

      {/* 🔍 검색창 */}
      <div className={styles["search-bar"]}>
        <input
          className={styles["search-input"]}
          type="text"
          placeholder="서비스 이름을 입력하세요"
          value={filterState.keyword}
          onChange={(e) => updateFilter({ keyword: e.target.value })}
        />
        <button
          className={styles["sort-btn"]}
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

      {/* 🧑‍💼 유형 필터 */}
      <div className={styles["service-type-buttons"]}>
        {SERVICE_TYPES.map((type) => (
          <button
            key={type}
            className={
              filterState.serviceType === type
                ? `${styles["pill-btn"]} ${styles.selected}`
                : styles["pill-btn"]
            }
            onClick={() => updateFilter({ serviceType: type })}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 📂 카테고리 필터 */}
      <div className={styles["category-buttons"]}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={
              filterState.category === cat
                ? `${styles["pill-btn"]} ${styles.selected}`
                : styles["pill-btn"]
            }
            onClick={() => updateFilter({ category: cat })}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ✅ 전체 보기 토글 */}
      <div className={styles["show-all-toggle"]}>
        <label>
          <input
            type="checkbox"
            checked={filterState.showAll}
            onChange={() => updateFilter({ showAll: !filterState.showAll })}
          />
          전체 혜택 보기
        </label>
      </div>

      {/* ✅ 현재 지역 표시 */}
      {fixedRegion && (
        <div className={styles["selected-region-info"]}>
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
