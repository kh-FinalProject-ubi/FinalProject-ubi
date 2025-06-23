import { useState } from "react";
import WelfareDetailModal from "./WelfareDetailModal";

const WelfareBenefitView = ({ district, benefits }) => {
  const cleanDistrict = district?.trim().normalize("NFC");
  const list = benefits[cleanDistrict];

  const [selectedDetail, setSelectedDetail] = useState(null);

  if (!list || list.length === 0)
    return <p>📭 {cleanDistrict}의 복지 혜택 정보가 없습니다.</p>;

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

  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>
        🏙️ <strong>{cleanDistrict}</strong>의 복지 혜택 목록 ({list.length}건)
      </h3>
      <ul>
        {list.map((item) => (
          <li
            key={item.servId}
            onClick={() => fetchDetail(item.servId)}
            style={{ cursor: "pointer" }}
          >
            <strong>{item.servNm}</strong> (
            {Array.isArray(item.intrsThemaNmArray)
              ? item.intrsThemaNmArray.join(", ")
              : item.intrsThemaNmArray || "주제 없음"}
            ) - {item.servDgst}
          </li>
        ))}
      </ul>

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
