import React, { useState, useMemo } from "react";
import WelfareDetailModal from "./WelfareDetailModal";
import "../styles/WelfareCompareView.css";
import useAuthStore from "../stores/useAuthStore";
import { filterBenefitsByStandard } from "../utils/filterBenefitsByStandard";

const WelfareCompareView = ({ districtA, districtB, benefits, isLoading }) => {
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const { token, memberStandard } = useAuthStore();

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

  const cleanA = districtA?.trim().normalize("NFC");
  const cleanB = districtB?.trim().normalize("NFC");

  const listA = benefits[cleanA] || [];
  const listB = benefits[cleanB] || [];

  const filteredListA = useMemo(
    () => filterBenefitsByStandard(listA, memberStandard, token, showAll),
    [listA, memberStandard, token, showAll]
  );

  const filteredListB = useMemo(
    () => filterBenefitsByStandard(listB, memberStandard, token, showAll),
    [listB, memberStandard, token, showAll]
  );

  if (isLoading) return <p>복지 데이터를 불러오는 중입니다...</p>;

  if (filteredListA.length === 0 || filteredListB.length === 0) {
    return <p>복지 혜택 데이터가 부족하여 비교할 수 없습니다.</p>;
  }

  return (
    <div className="welfare-compare-view">
      <h3>
        {cleanA} vs {cleanB} 복지 혜택 비교
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
                  filteredListA[idx] && fetchDetail(filteredListA[idx].servId)
                }
                style={{ cursor: "pointer" }}
              >
                {filteredListA[idx] ? (
                  <>
                    <strong>{filteredListA[idx].servNm}</strong> <br />(
                    {Array.isArray(filteredListA[idx].intrsThemaNmArray)
                      ? filteredListA[idx].intrsThemaNmArray.join(", ")
                      : filteredListA[idx].intrsThemaNmArray || "주제 없음"}
                    ) - {filteredListA[idx].servDgst}
                  </>
                ) : (
                  "-"
                )}
              </td>

              <td
                onClick={() =>
                  filteredListB[idx] && fetchDetail(filteredListB[idx].servId)
                }
                style={{ cursor: "pointer" }}
              >
                {filteredListB[idx] ? (
                  <>
                    <strong>{filteredListB[idx].servNm}</strong> <br />(
                    {Array.isArray(filteredListB[idx].intrsThemaNmArray)
                      ? filteredListB[idx].intrsThemaNmArray.join(", ")
                      : filteredListB[idx].intrsThemaNmArray || "주제 없음"}
                    ) - {filteredListB[idx].servDgst}
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
