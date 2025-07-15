import React, { useMemo, useState } from "react";
import useLocalBenefitData from "../../hook/welfareService/useLocalBenefitData";
import useAuthStore from "../../stores/useAuthStore";
import "../../styles/welfarefacility/FacilitySearchPage.css"; // 복지시설 스타일 재사용

const LocalBenefitModal = ({ onSelect, onClose }) => {
  const { data: benefits, loading, error } = useLocalBenefitData();
  const { regionCity, regionDistrict } = useAuthStore((state) => state);

  const [keyword, setKeyword] = useState("");

  const filteredBenefits = useMemo(() => {
    if (!Array.isArray(benefits)) return [];

    return benefits
      .filter((item) => {
        const isExactMatch =
          item.regionCity === regionCity &&
          item.regionDistrict === regionDistrict;

        const isMunicipalWide =
          item.regionCity === regionCity &&
          (!item.regionDistrict || item.regionDistrict.trim() === "");

        return isExactMatch || isMunicipalWide;
      })
      .filter((item) =>
        keyword.trim() === ""
          ? true
          : item.title?.toLowerCase().includes(keyword.toLowerCase())
      );
  }, [benefits, regionCity, regionDistrict, keyword]);

  const handleSelect = (item) => {
    const serviceId = item.apiServiceId || item.servId || item.id || "";
    const name = item.title ?? "제목 없음";
    const agency = item.agency || item.source || "지자체";
    const category = item.category || "기타";

    if (onSelect) {
      onSelect({ serviceId, name, agency, category });
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ maxHeight: "80vh", overflowY: "auto", padding: "20px" }}
      >
        <h2>
          복지 혜택 선택 (작성자 지역: {regionCity} {regionDistrict})
        </h2>
        <button
          onClick={onClose}
          style={{ float: "right", fontWeight: "bold" }}
        >
          ✖
        </button>

        {/* 🔍 검색창만 추가 */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="혜택명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="search-input"
          />
        </div>

        {loading && <p>로딩 중...</p>}
        {error && <p style={{ color: "red" }}>데이터를 불러오지 못했습니다.</p>}
        {!loading && filteredBenefits.length === 0 && (
          <p>조건에 맞는 복지 혜택이 없습니다.</p>
        )}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredBenefits.map((item, idx) => {
            const displayId = item.apiServiceId || item.servId || item.id;
            return (
              <li
                key={`${displayId}-${idx}`}
                style={{
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                }}
                onClick={() => {
                  handleSelect(item);
                  onClose();
                }}
              >
               <strong>
  {item.title} (
    {item.regionDistrict
      ? item.regionDistrict
      : `${item.regionCity} 공통`}
  )
</strong>
<br />
                <small>카테고리: {item.category || "기타"}</small> <br />
                <small>ID: {displayId}</small>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default LocalBenefitModal;
