import React, { useState } from "react";

const WelfareSearchFilter = ({ onFilterChange }) => {
  const [keyword, setKeyword] = useState("");
  const [serviceType, setServiceType] = useState("전체");
  const [category, setCategory] = useState("전체");
  const [sortOrder, setSortOrder] = useState("latest");
  const [showAll, setShowAll] = useState(false);

  const notifyChange = (newValues = {}) => {
    onFilterChange({
      keyword,
      serviceType,
      category,
      sortOrder,
      showAll,
      ...newValues,
    });
  };

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    notifyChange({ keyword: value });
  };

  const handleServiceTypeChange = (type) => {
    setServiceType(type);
    notifyChange({ serviceType: type });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    notifyChange({ category: cat });
  };

  const handleSortToggle = () => {
    const next = sortOrder === "latest" ? "oldest" : "latest";
    setSortOrder(next);
    notifyChange({ sortOrder: next });
  };

  const handleShowAllToggle = () => {
    const next = !showAll;
    setShowAll(next);
    notifyChange({ showAll: next });
  };

  return (
    <div className="welfare-search-filter">
      <h3>공공 서비스 조회</h3>

      <div className="search-bar">
        <input
          type="text"
          placeholder="서비스 이름을 입력하세요"
          value={keyword}
          onChange={handleKeywordChange}
        />
        <button onClick={handleSortToggle}>
          정렬 ▾ ({sortOrder === "latest" ? "최신순" : "오래된순"})
        </button>
      </div>

      <div className="service-type-buttons">
        {["전체", "일반", "노인", "청년", "아동", "장애인", "임산부"].map(
          (type) => (
            <button
              key={type}
              className={serviceType === type ? "selected" : ""}
              onClick={() => handleServiceTypeChange(type)}
            >
              {type}
            </button>
          )
        )}
      </div>

      {/* ✅ '의약'과 시설 관련 항목 제거 */}
      <div className="category-buttons">
        {["전체", "복지 혜택", "구인", "기타"].map((cat) => (
          <button
            key={cat}
            className={category === cat ? "selected" : ""}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="show-all-toggle">
        <label>
          <input
            type="checkbox"
            checked={showAll}
            onChange={handleShowAllToggle}
          />
          전체 혜택 보기
        </label>
      </div>
    </div>
  );
};

export default WelfareSearchFilter;
