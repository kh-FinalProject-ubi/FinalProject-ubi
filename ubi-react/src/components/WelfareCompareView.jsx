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

  const listA = benefits[cleanA];
  const listB = benefits[cleanB];

  console.log("🔍 비교 지자체 A:", `"${cleanA}"`);
  console.log("🔍 비교 지자체 B:", `"${cleanB}"`);
  console.log("📦 전체 benefits keys:", Object.keys(benefits));

  if (isLoading) return <p>복지 데이터를 불러오는 중입니다...</p>;

  if (!listA || !listB) {
    return <p>복지혜택 데이터가 부족하여 비교할 수 없습니다.</p>;
  }

  return (
    <div>
      <h3>
        {cleanA} vs {cleanB} 복지 혜택 비교
      </h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {cleanA}
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              {cleanB}
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(listA.length, listB.length) }).map(
            (_, idx) => (
              <tr key={idx}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => listA[idx] && fetchDetail(listA[idx].servId)}
                >
                  {listA[idx] ? (
                    <>
                      <strong>{listA[idx].servNm}</strong> <br />(
                      {listA[idx].intrsThemaNmArray}) - {listA[idx].servDgst}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    cursor: "pointer",
                  }}
                  onClick={() => listB[idx] && fetchDetail(listB[idx].servId)}
                >
                  {listB[idx] ? (
                    <>
                      <strong>{listB[idx].servNm}</strong> <br />(
                      {listB[idx].intrsThemaNmArray}) - {listB[idx].servDgst}
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
