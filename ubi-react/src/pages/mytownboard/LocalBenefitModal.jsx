import React, { useMemo } from "react";
import useLocalBenefitData from "../../hook/welfareService/useLocalBenefitData";
import useAuthStore from "../../stores/useAuthStore";

const LocalBenefitModal = ({ onSelect, onClose }) => {
  const { data: benefits, loading, error } = useLocalBenefitData();
  const { regionCity, regionDistrict } = useAuthStore((state) => state);

  const filteredBenefits = useMemo(() => {
    if (!Array.isArray(benefits)) return [];

    return benefits.filter((item) => {
      const isExactMatch =
        item.regionCity === regionCity &&
        item.regionDistrict === regionDistrict;

      const isMunicipalWide =
        item.regionCity === regionCity &&
        (!item.regionDistrict || item.regionDistrict.trim() === "");

      return isExactMatch || isMunicipalWide;
    });
  }, [benefits, regionCity, regionDistrict]);

 const handleSelect = (item) => {
  console.log("✅ 선택된 복지 혜택:", item);

  const serviceId = item.apiServiceId || item.servId || item.id || "";
  const name = item.title ?? "제목 없음";
  const agency = item.agency || item.source || "지자체";
  const category = item.category || "기타";

  if (onSelect) {
    onSelect({ serviceId, name, agency, category });
  }
};
  return (
    <div className="modal-wrapper">
      <div className="modal-content">
        <h2>복지 혜택 선택</h2>
        {loading && <p>로딩 중...</p>}
        {error && <p>데이터를 불러오지 못했습니다.</p>}

        <div className="modal-benefit-grid">
          {filteredBenefits.length > 0 ? (
            filteredBenefits.map((item) => {
              const displayId = item.apiServiceId || item.servId || item.id;
              return (
                <div
                  className="modal-benefit-card"
                  key={displayId}
                  onClick={() => handleSelect(item)}
                >
                  <h3>{item.title}</h3>
                  <p>종류: {item.category}</p>
                  <p>지역: {item.regionDistrict || "제한없음"}</p>
                  <p>ID: {displayId}</p>
                </div>
              );
            })
          ) : (
            <p>해당 지역 복지 혜택이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocalBenefitModal;
