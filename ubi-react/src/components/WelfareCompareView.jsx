import React, { useState } from "react";
import WelfareDetailModal from "./WelfareDetailModal";

const WelfareCompareView = ({ districtA, districtB, benefits, isLoading }) => {
  const [selectedDetail, setSelectedDetail] = useState(null);

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

  if (isLoading) return <p>복지 데이터를 불러오는 중입니다...</p>;

  if (listA.length === 0 || listB.length === 0) {
    return <p>복지 혜택 데이터가 부족하여 비교할 수 없습니다.</p>;
  }

  return (
    <div className="welfare-compare-view">
      <h3>
        {cleanA} vs {cleanB} 복지 혜택 비교
      </h3>

      <table className="welfare-compare-table">
        <thead>
          <tr>
            <th>{cleanA}</th>
            <th>{cleanB}</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(listA.length, listB.length) }).map(
            (_, idx) => (
              <tr key={idx}>
                <td
                  onClick={() => listA[idx] && fetchDetail(listA[idx].servId)}
                  style={{ cursor: "pointer" }}
                >
                  {listA[idx] ? (
                    <>
                      <strong>{listA[idx].servNm}</strong> <br />(
                      {Array.isArray(listA[idx].intrsThemaNmArray)
                        ? listA[idx].intrsThemaNmArray.join(", ")
                        : listA[idx].intrsThemaNmArray || "주제 없음"}
                      ) - {listA[idx].servDgst}
                    </>
                  ) : (
                    "-"
                  )}
                </td>

                <td
                  onClick={() => listB[idx] && fetchDetail(listB[idx].servId)}
                  style={{ cursor: "pointer" }}
                >
                  {listB[idx] ? (
                    <>
                      <strong>{listB[idx].servNm}</strong> <br />(
                      {Array.isArray(listB[idx].intrsThemaNmArray)
                        ? listB[idx].intrsThemaNmArray.join(", ")
                        : listB[idx].intrsThemaNmArray || "주제 없음"}
                      ) - {listB[idx].servDgst}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            )
          )}
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
