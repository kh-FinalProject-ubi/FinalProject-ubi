import React, { useState } from "react";

const WelfareSearchFilter = ({ onFilterChange }) => {
  const [keyword, setKeyword] = useState("");
  const [serviceType, setServiceType] = useState("전체");
  const [category, setCategory] = useState("전체");

  const handleKeywordChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    onFilterChange({ keyword: value, serviceType, category });
  };

  const handleServiceTypeChange = (type) => {
    setServiceType(type);
    onFilterChange({ keyword, serviceType: type, category });
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    onFilterChange({ keyword, serviceType, category: cat });
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
        <button>정렬 ▾</button>
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

      <div className="category-buttons">
        {[
          "전체",
          "복지 혜택",
          "구인",
          "의약",
          "기타",
          "행정시설",
          "의료시설",
          "요양시설",
          "체육시설",
        ].map((cat) => (
          <button
            key={cat}
            className={category === cat ? "selected" : ""}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WelfareSearchFilter;
