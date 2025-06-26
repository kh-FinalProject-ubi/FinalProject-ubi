import { useState, useMemo } from "react";
import WelfareDetailModal from "./WelfareDetailModal";
import useAuthStore from "../stores/useAuthStore";
import "../styles/WelfareBenefitView.css";
import { filterBenefitsByStandard } from "../utils/filterBenefitsByStandard";

const WelfareBenefitView = ({ district, benefits, isLoading }) => {
  const cleanDistrict = district?.trim().normalize("NFC");
  const list = benefits[cleanDistrict] ?? [];

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { token, memberStandard } = useAuthStore();

  const filteredList = useMemo(() => {
    return filterBenefitsByStandard(list, memberStandard, token, showAll);
  }, [list, token, memberStandard, showAll]);

  const fetchDetail = async (servId) => {
    try {
      const res = await fetch(
        `/api/welfare-curl/welfare-detail?servId=${servId}`
      );
      const data = await res.json();
      setSelectedDetail(data.detail);
    } catch (err) {
      console.error("상세 정보 불러오기 실패:", err);
    }
  };

  if (isLoading) return <p>불러오는 중...</p>;

  if (!filteredList || filteredList.length === 0)
    return <p>📭 {cleanDistrict}의 복지 혜택 정보가 없습니다.</p>;

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>
        🏙️ <strong>{cleanDistrict}</strong>의 복지 혜택 목록 (
        {filteredList.length}건)
      </h3>

      {token && (
        <label style={{ display: "block", margin: "0.5rem 0" }}>
          <input
            type="checkbox"
            checked={showAll}
            onChange={() => setShowAll((prev) => !prev)}
          />{" "}
          전체 보기
        </label>
      )}

      <div className="benefit-card-list">
        {filteredList.map((item) => (
          <div
            className="benefit-card"
            key={item.servId}
            onClick={() => fetchDetail(item.servId)}
          >
            <h4 className="benefit-title">{item.servNm}</h4>
            <p className="benefit-tags">
              (
              {Array.isArray(item.intrsThemaNmArray)
                ? item.intrsThemaNmArray.join(", ")
                : item.intrsThemaNmArray || "주제 없음"}
              )
            </p>
            <p className="benefit-description">{item.servDgst}</p>
          </div>
        ))}
      </div>

      {selectedDetail && (
        <WelfareDetailModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}
    </div>
  );
};

export default WelfareBenefitView;
