import { useState, useMemo } from "react";
import WelfareDetailModal from "./WelfareDetailModal";
import useAuthStore from "../stores/useAuthStore";
import "../styles/WelfareBenefitView.css";
import { filterBenefitsByStandard } from "../utils/filterBenefitsByStandard";
import { mapCleanFullName } from "../utils/regionUtils";

const WelfareBenefitView = ({ district = "", benefits = [], isLoading }) => {
  const cleanDistrict = useMemo(
    () =>
      mapCleanFullName(
        district?.trim().normalize("NFC") || "서울특별시 종로구"
      ),
    [district]
  );

  console.log("🧭 props.district:", district);
  console.log("🧭 cleanDistrict:", cleanDistrict);
  console.log("🧭 받은 benefits.length:", benefits?.length);

  const { token, memberStandard } = useAuthStore();
  const [showAll, setShowAll] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);

  // 1️⃣ 지역 필터링
  console.log(
    "🧾 benefits 지역 필드 예시:",
    benefits.map((b) => ({
      regionCity: b.regionCity,
      regionDistrict: b.regionDistrict,
      full: `${b.regionCity} ${b.regionDistrict}`.trim(),
    }))
  );
  const regionFilteredList = useMemo(() => {
    const result = benefits.filter((item) => {
      const normalized = `${item.regionCity} ${item.regionDistrict}`.trim();
      return normalized === cleanDistrict;
    });
    console.log("🔍 regionFilteredList.length:", result.length);
    return result;
  }, [benefits, cleanDistrict]);

  // 2️⃣ 기준조건 필터링
  const filteredList = useMemo(() => {
    const result = filterBenefitsByStandard(
      regionFilteredList,
      memberStandard,
      token,
      showAll
    );
    console.log("🎯 filteredList.length:", result.length);
    return result;
  }, [regionFilteredList, memberStandard, token, showAll]);

  const fetchDetail = async (servId) => {
    if (!servId) return;
    const pureId = servId.replace("bokjiro-", ""); // ← 여기 핵심
    try {
      console.log("📡 상세 조회 요청:", pureId);
      const res = await fetch(
        `/api/welfare-curl/welfare-detail?servId=${pureId}`
      );
      const data = await res.json();

      if (data?.detail?.resultCode === "40") {
        alert("해당 복지 혜택의 상세 정보가 없습니다.");
        return;
      }

      setSelectedDetail(data.detail);
    } catch (err) {
      console.error("❌ 상세 정보 불러오기 실패:", err);
    }
  };

  // ✅ 로딩
  if (isLoading) {
    console.log("⌛ 로딩 중...");
    return <p>⏳ 복지 정보를 불러오는 중입니다...</p>;
  }

  // ✅ 데이터 없음
  if (!filteredList || filteredList.length === 0) {
    console.log("📭 조건에 맞는 복지 혜택 없음");
    return (
      <p>
        📭 <strong>{cleanDistrict}</strong>의 복지 혜택 정보가 없습니다.
      </p>
    );
  }

  
  return (
    <div style={{ marginTop: "1rem" }}>
      <h3>
        🏙️ <strong>{cleanDistrict}</strong>의 복지 혜택 목록 (
        {filteredList.length}건)
      </h3>

      {token && (
        <label className="toggle-showall">
          <input
            type="checkbox"
            checked={showAll}
            onChange={() => {
              console.log("🌀 showAll 변경:", !showAll);
              setShowAll((prev) => !prev);
            }}
          />{" "}
          전체 보기
        </label>
      )}

      <div className="benefit-card-list">
        {filteredList.map((item, idx) => (
          <div
            className="benefit-card"
            key={item.servId || item.id || idx}
            onClick={() => fetchDetail(item.servId || item.id)}
          >
            <h4 className="benefit-title">{item.servNm || item.title}</h4>
            <p className="benefit-tags">
              {Array.isArray(item.intrsThemaNmArray)
                ? item.intrsThemaNmArray.join(", ")
                : item.intrsThemaNmArray || "주제 없음"}
            </p>
            <p className="benefit-description">
              {item.servDgst || item.description}
            </p>
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
