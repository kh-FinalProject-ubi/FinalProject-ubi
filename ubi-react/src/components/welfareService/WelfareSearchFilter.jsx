import React, { useState } from "react";

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

const WelfareSearchFilter = ({ onFilterChange }) => {
  const [filterState, setFilterState] = useState({
    keyword: "",
    serviceType: "전체",
    category: "전체",
    sortOrder: "latest",
    showAll: false,
  });

  // 상태 변경 & 외부에 알림
  const updateFilter = (changes) => {
    const newState = { ...filterState, ...changes };
    setFilterState(newState);
    onFilterChange(newState);
  };

  return (
    <div className="welfare-search-filter">
      <h3>공공 서비스 조회</h3>

      {/* 🔎 검색창 + 정렬 토글 */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="서비스 이름을 입력하세요"
          value={filterState.keyword}
          onChange={(e) => updateFilter({ keyword: e.target.value })}
        />
        <button
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

      {/* 🧑‍🤝‍🧑 대상 버튼 */}
      <div className="service-type-buttons">
        {SERVICE_TYPES.map((type) => (
          <button
            key={type}
            className={filterState.serviceType === type ? "selected" : ""}
            onClick={() => updateFilter({ serviceType: type })}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 📂 카테고리 버튼 */}
      <div className="category-buttons">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={filterState.category === cat ? "selected" : ""}
            onClick={() => updateFilter({ category: cat })}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ✅ 전체 혜택 보기 토글 */}
      <div className="show-all-toggle">
        <label>
          <input
            type="checkbox"
            checked={filterState.showAll}
            onChange={() => updateFilter({ showAll: !filterState.showAll })}
          />
          전체 혜택 보기
        </label>
      </div>
    </div>
  );
};

export default WelfareSearchFilter;
