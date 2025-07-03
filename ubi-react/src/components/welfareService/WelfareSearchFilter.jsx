import React, { useState, useEffect } from "react";
import useAuthStore from "../../stores/useAuthStore";
import cityDistrictMap from "../../constants/cityDistrictMap"; // 👈 경로 확인

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
  const token = useAuthStore((state) => state.token);
  const userCity = useAuthStore((state) => state.regionCity);
  const userDistrict = useAuthStore((state) => state.regionDistrict);

  const [region, setRegion] = useState({
    city: token ? userCity : "서울특별시",
    district: token ? userDistrict : "종로구",
  });

  const [filterState, setFilterState] = useState({
    keyword: "",
    serviceType: "전체",
    category: "전체",
    sortOrder: "latest",
    showAll: false,
  });

  const updateFilter = (changes) => {
    const newState = { ...filterState, ...changes };
    setFilterState(newState);
    onFilterChange({ ...newState, region });
  };

  useEffect(() => {
    onFilterChange({ ...filterState, region });
  }, [region]);

  return (
    <div className="welfare-search-filter">
      <h3>공공 서비스 조회</h3>

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

      <div className="region-select">
        <select
          value={region.city}
          onChange={(e) =>
            setRegion({
              city: e.target.value,
              district: cityDistrictMap[e.target.value]?.[0] || "",
            })
          }
        >
          {Object.keys(cityDistrictMap).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          value={region.district}
          onChange={(e) => setRegion({ ...region, district: e.target.value })}
        >
          {(cityDistrictMap[region.city] || []).map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

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
