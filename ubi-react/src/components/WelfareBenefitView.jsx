import { useState } from "react";
import WelfareDetailModal from "./WelfareDetailModal";

const WelfareBenefitView = ({ district, benefits }) => {
  const cleanDistrict = district?.trim().normalize("NFC");
  const list = benefits[cleanDistrict];

  const [selectedDetail, setSelectedDetail] = useState(null);
  console.log("🔍 선택된 지자체명:", cleanDistrict);
  console.log("🧾 해당 지자체 복지 데이터:", list);
  console.log("📦 전체 benefitsData keys:", Object.keys(benefits));

  if (!list) return <p>해당 지역의 복지혜택 데이터가 없습니다.</p>;

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
    <div>
      <h3>{cleanDistrict} 복지 혜택 목록</h3>
      <ul>
        {list.map((item) => (
          <li
            key={item.servId}
            onClick={() => fetchDetail(item.servId)}
            style={{ cursor: "pointer" }}
          >
            <strong>{item.servNm}</strong> ({item.intrsThemaNmArray}) -{" "}
            {item.servDgst}
          </li>
        ))}
      </ul>
      <WelfareDetailModal
        detail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
    </div>
  );
};

export default WelfareBenefitView;
