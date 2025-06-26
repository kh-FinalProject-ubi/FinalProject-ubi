import { useState, useMemo } from "react";
import WelfareDetailModal from "./WelfareDetailModal";
import useAuthStore from "../stores/useAuthStore";
import "../styles/WelfareBenefitView.css";
console.log("💡 Zustand 상태:", useAuthStore.getState());

const authState = useAuthStore.getState();
console.log("💡 현재 memberStandard:", authState.memberStandard);

const standardKeywordMap = {
  노인: "노인",
  청년: "청년",
  아동: "아동",
  "노인+장애인": "노인",
  "청년+장애인": "청년",
  "아동+장애인": "아동",
  장애인: "장애인",
};

const WelfareBenefitView = ({ district, benefits, isLoading }) => {
  const cleanDistrict = district?.trim().normalize("NFC");
  const list = benefits[cleanDistrict] ?? [];

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { token, memberStandard } = useAuthStore();

  // 필터링 로직
  const filteredList = useMemo(() => {
    console.log("✅ 필터링 실행됨");
    console.log("memberStandard:", memberStandard);
    console.log("로그인 여부(token):", !!token);
    console.log("showAll 상태:", showAll);

    if (showAll || !token) return list;

    const keyword = standardKeywordMap[memberStandard];
    if (!keyword) return list;

    if (memberStandard === "일반") {
      return list.filter((item) => {
        const targets = Array.isArray(item.lifeNmArray)
          ? item.lifeNmArray
          : [item.lifeNmArray || ""];

        const hasSpecialGroup = targets.some((life) =>
          ["노인", "청년", "아동", "장애인"].includes(life)
        );

        if (hasSpecialGroup) {
          console.log("🚫 제외됨:", item.servNm, targets);
        } else {
          console.log("✅ 포함됨:", item.servNm, targets);
        }

        return !hasSpecialGroup;
      });
    }

    return list.filter((item) => {
      const targets = Array.isArray(item.lifeNmArray)
        ? item.lifeNmArray
        : [item.lifeNmArray || ""];

      const match = targets.includes(keyword);
      if (match) {
        console.log("✅ 포함됨:", item.servNm, targets);
      }
      return match;
    });
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
