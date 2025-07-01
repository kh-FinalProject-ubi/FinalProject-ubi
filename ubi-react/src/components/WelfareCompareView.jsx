import React, { useState, useMemo } from "react";
import WelfareDetailModal from "./WelfareDetailModal";
import "../styles/WelfareCompareView.css";
import useAuthStore from "../stores/useAuthStore";
import { filterBenefitsByStandard } from "../utils/filterBenefitsByStandard";
import { mapCleanFullName } from "../utils/regionUtils";

const WelfareCompareView = ({
  districtA,
  districtB,
  benefits = {},
  isLoading,
}) => {
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const { token, memberStandard } = useAuthStore();

  const cleanA = districtA?.trim().normalize("NFC") ?? "";
  const cleanB = districtB?.trim().normalize("NFC") ?? "";

  // ✅ 먼저 정규화
  const normalizedDistrictA = useMemo(() => {
    const norm = mapCleanFullName(cleanA);
    console.log("📌 normalizedDistrictA:", norm);
    return norm;
  }, [cleanA]);

  const normalizedDistrictB = useMemo(() => {
    const norm = mapCleanFullName(cleanB);
    console.log("📌 normalizedDistrictB:", norm);
    return norm;
  }, [cleanB]);

  // ✅ 그 다음에 listA, listB 생성
  const listA = useMemo(() => {
    const list = benefits?.[normalizedDistrictA];
    console.log("📦 listA length:", list?.length);
    return Array.isArray(list) ? list : [];
  }, [benefits, normalizedDistrictA]);

  const listB = useMemo(() => {
    const list = benefits?.[normalizedDistrictB];
    console.log("📦 listB length:", list?.length);
    return Array.isArray(list) ? list : [];
  }, [benefits, normalizedDistrictB]);

  // ✅ 기준 필터
  const filteredListA = useMemo(() => {
    const result = filterBenefitsByStandard(
      listA,
      memberStandard,
      token,
      showAll
    );
    console.log("🔍 filteredListA length:", result.length);
    return result;
  }, [listA, memberStandard, token, showAll]);

  const filteredListB = useMemo(() => {
    const result = filterBenefitsByStandard(
      listB,
      memberStandard,
      token,
      showAll
    );
    console.log("🔍 filteredListB length:", result.length);
    return result;
  }, [listB, memberStandard, token, showAll]);

  const fetchDetail = async (servId) => {
    if (!servId) return;
    try {
      console.log("📡 상세 조회 요청:", servId);
      const res = await fetch(
        `/api/welfare-curl/welfare-detail?servId=${servId}`
      );
      const data = await res.json();
      console.log("📥 상세 조회 응답:", data);
      setSelectedDetail(data.detail);
    } catch (err) {
      console.error("❌ 상세 정보 불러오기 실패:", err);
    }
  };
  console.log("🔎 filteredListA 예시:", filteredListA[0]);
  console.log("🔎 filteredListB 예시:", filteredListB[0]);
  // ✅ 로딩 상태
  if (isLoading) {
    console.log("⏳ 복지 데이터를 불러오는 중입니다...");
    return <p>⏳ 복지 데이터를 불러오는 중입니다...</p>;
  }

  // ✅ 데이터 없음
  if (!filteredListA.length || !filteredListB.length) {
    console.warn("⚠️ 비교 불가 - 필터 결과 부족", {
      filteredListA: filteredListA.length,
      filteredListB: filteredListB.length,
    });
    return <p>⚠️ 복지 혜택 데이터가 부족하여 비교할 수 없습니다.</p>;
  }

  return (
    <div className="welfare-compare-view">
      <h3>
        🆚 {cleanA} vs {cleanB} 복지 혜택 비교
      </h3>

      {token && (
        <label style={{ display: "block", margin: "0.5rem 0" }}>
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

      <table className="welfare-compare-table">
        <thead>
          <tr>
            <th>{cleanA}</th>
            <th>{cleanB}</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({
            length: Math.max(filteredListA.length, filteredListB.length),
          }).map((_, idx) => (
            <tr key={idx}>
              <td
                onClick={() =>
                  filteredListA[idx] &&
                  fetchDetail(
                    filteredListA[idx].servId || filteredListA[idx].id
                  )
                }
                style={{ cursor: "pointer" }}
              >
                {filteredListA[idx] ? (
                  <>
                    <strong>
                      {filteredListA[idx].servNm ||
                        filteredListA[idx].title ||
                        "제목 없음"}
                    </strong>{" "}
                    <br />(
                    {Array.isArray(filteredListA[idx].intrsThemaNmArray)
                      ? filteredListA[idx].intrsThemaNmArray.join(", ")
                      : filteredListA[idx].intrsThemaNmArray || "주제 없음"}
                    ) -{" "}
                    {filteredListA[idx].servDgst ||
                      filteredListA[idx].description ||
                      "설명 없음"}
                  </>
                ) : (
                  "-"
                )}
              </td>

              <td
                onClick={() =>
                  filteredListB[idx] &&
                  fetchDetail(
                    filteredListB[idx].servId || filteredListB[idx].id
                  )
                }
                style={{ cursor: "pointer" }}
              >
                {filteredListB[idx] ? (
                  <>
                    <strong>
                      {filteredListB[idx].servNm ||
                        filteredListB[idx].title ||
                        "제목 없음"}
                    </strong>{" "}
                    <br />(
                    {Array.isArray(filteredListB[idx].intrsThemaNmArray)
                      ? filteredListB[idx].intrsThemaNmArray.join(", ")
                      : filteredListB[idx].intrsThemaNmArray || "주제 없음"}
                    ) -{" "}
                    {filteredListB[idx].servDgst ||
                      filteredListB[idx].description ||
                      "설명 없음"}
                  </>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDetail && (
        <WelfareDetailModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
        />
      )}
    </div>
  );
};

export default WelfareCompareView;
