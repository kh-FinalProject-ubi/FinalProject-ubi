import React, { useEffect, useState } from "react";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";

export default function StatList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 장기요양기관 목록 호출
        const res = await axios.get("/api/stat");
        console.log("📦 목록 응답:", res.data);

        let parsed;
        if (typeof res.data === "string") {
          const parser = new XMLParser();
          parsed = parser.parse(res.data);
        } else {
          parsed = res.data;
        }

        let itemList = [];
        if (parsed?.response?.body?.items?.item) {
          itemList = Array.isArray(parsed.response.body.items.item)
            ? parsed.response.body.items.item
            : [parsed.response.body.items.item];
        }

        console.log("📋 추출된 기관 목록:", itemList);

        // 2. 상세 정보 순차 조회
        const detailedList = [];

        // 딜레이 함수 (200ms)
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        // 제한 수 (예: 최대 30개만 처리)
        const limitedList = itemList.slice(0, 30);

        for (const item of limitedList) {
          const code = item.longTermAdminSym;

          try {
            const detailRes = await axios.get(
              `/api/stat/detail/conv?insttSym=${code}`
            );
            console.log(`🔍 ${code} 상세 응답:`, detailRes.data);

            const parser = new XMLParser();
            const detailParsed = parser.parse(detailRes.data);
            const detailItem = detailParsed?.response?.body?.items?.item;

            detailedList.push({
              ...item,
              convInfo: detailItem || null,
            });
          } catch (err) {
            console.error(`❌ ${code} 상세 조회 실패`, err);
            detailedList.push({
              ...item,
              convInfo: null,
            });
          }

          // 초당 호출 제한 우회를 위해 딜레이
          await sleep(200); // 0.2초 대기 (초당 5건 이하)
        }

        // 상태 업데이트
        setItems(detailedList);
      } catch (err) {
        console.error("❌ 목록 조회 실패", err);
      }
    };

    fetchData();
  }, []);

  if (items.length === 0) return <p>📭 데이터가 없습니다.</p>;

  return (
    <div>
      <h2>노인 장기요양기관 목록 + 협약기관 정보</h2>
      <ul>
        {items.map((item, idx) => (
          <li key={idx} style={{ marginBottom: "1.5rem" }}>
            <strong>기관명:</strong> {item.adminNm} <br />
            <strong>기관기호:</strong> {item.longTermAdminSym} <br />
            <strong>시도코드:</strong> {item.siDoCd} /{" "}
            <strong>시군구코드:</strong> {item.siGunGuCd} <br />
            <strong>지정일:</strong> {item.longTermPeribRgtDt} <br />
            <strong>협약기관명:</strong> {item.convInfo?.yoyangNm || "없음"}{" "}
            <br />
            <strong>협약 시작일:</strong> {item.convInfo?.adptFrDt || "없음"}{" "}
            <br />
            <strong>협약 종료일:</strong> {item.convInfo?.adptToDt || "없음"}{" "}
            <br />
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}
