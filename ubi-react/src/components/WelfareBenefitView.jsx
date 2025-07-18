import { useState, useMemo } from "react";
import WelfareDetailModal from "./WelfareDetailModal";
import useAuthStore from "../stores/useAuthStore";
import styles from "../styles/WelfareBenefitView.module.css";
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
  const regionFilteredList = useMemo(() => {
    const result = benefits.filter((item) => {
      const normalized = `${item.regionCity} ${item.regionDistrict}`.trim();
      return normalized === cleanDistrict;
    });
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
    return result;
  }, [regionFilteredList, memberStandard, token, showAll]);

  const fetchDetail = async (servId) => {
    if (!servId) return;
    const pureId = servId.replace("bokjiro-", "");
    try {
      const res = await fetch(
        `/api/welfare-curl/welfare-detail?servId=${pureId}`
      );
      const data = await res.json();

      if (data?.detail?.resultCode === "40") {
        alert("해당 복지 혜택의 상세 정보가 없습니다.");
        return;
      }

      setSelectedDetail(data.detail);
    } catch (err) {}
  };

  // ✅ 로딩
  if (isLoading) {
    return <p>⏳ 복지 정보를 불러오는 중입니다...</p>;
  }

  // ✅ 데이터 없음
  if (!filteredList || filteredList.length === 0) {
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
        <label className={styles.toggleShowAll}>
          <input
            type="checkbox"
            checked={showAll}
            onChange={() => setShowAll((prev) => !prev)}
          />
          전체 보기
        </label>
      )}

      <div className={styles.benefitCardList}>
        {filteredList.map((item, idx) => (
          <div
            className={styles.benefitCard}
            key={item.servId || item.id || idx}
            onClick={() => fetchDetail(item.servId || item.id)}
          >
            <h4 className={styles.benefitTitle}>{item.servNm || item.title}</h4>
            <p className={styles.benefitTags}>
              {Array.isArray(item.intrsThemaNmArray)
                ? item.intrsThemaNmArray.join(", ")
                : item.intrsThemaNmArray || "주제 없음"}
            </p>
            <p className={styles.benefitDescription}>
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
