import React, { useMemo, useState } from "react";
import useLocalBenefitData from "../../hook/welfareService/useLocalBenefitData";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/board/MyTownModal.module.css"; // 복지시설 모달과 동일한 CSS 사용

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

    onSelect?.({ serviceId, name, agency, category });
    onClose?.();
  };

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

 
          <h2 className={styles["modal-title"]}>복지 혜택 선택</h2>


        <input
          type="text"
          placeholder="혜택명 검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className={styles["search-input"]}
        />

        {loading && <p className={styles["loading-text"]}>불러오는 중...</p>}
        {error && (
          <p className={styles["error-text"]}>
            데이터를 불러오지 못했습니다.
          </p>
        )}
        {!loading && filteredBenefits.length === 0 && (
          <p className={styles["empty-text"]}>
            조건에 맞는 복지 혜택이 없습니다.
          </p>
        )}

        <ul className={styles["facility-list"]}>
          {filteredBenefits.map((item, idx) => {
            const serviceId = item.apiServiceId || item.servId || item.id;
            const title = item.title || "제목 없음";
            const region =
             `${item.regionCity} ${item.regionDistrict}` || `${item.regionCity} `;
            const category = item.category || "기타";

            return (
              <li
                key={`${serviceId}-${idx}`}
                className={styles["facility-item"]}
                onClick={() => handleSelect(item)}
              >         
                <div className={styles["facility-info"]}>
                   <div className={styles["region-label"]}>
   {region}
          </div>
                  <strong>
                    {title} 
                  </strong>
                  <small>{category}</small>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default LocalBenefitModal;
