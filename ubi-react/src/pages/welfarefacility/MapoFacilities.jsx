// 📁 src/pages/welfarefacility/MapoFacilities.jsx
import { useEffect, useState } from "react";
import Papa from "papaparse";
import FacilityCard from "../../components/welfarefacility/FacilityCard";

export default function MapoFacilities() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      Papa.parse("/csv/mapo.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
          console.log("✅ CSV 결과:", results.data);

          // 로그 찍고 구조 확인
          if (!Array.isArray(results.data)) {
            throw new Error("CSV 데이터가 배열이 아닙니다.");
          }

          setData(results.data);
          setLoading(false);
        },
        error: function (err) {
          console.error("❌ CSV 파싱 오류:", err);
          setError(err);
          setLoading(false);
        },
      });
    } catch (e) {
      console.error("❌ useEffect 전체 오류:", e);
      setError(e);
      setLoading(false);
    }
  }, []);

  if (loading) return <p>⏳ 로딩 중입니다...</p>;
  if (error) return <p>🚫 오류 발생: {error.message}</p>;

  if (!data || data.length === 0) return <p>📭 시설 데이터 없음</p>;

  return (
    <div>
      <h2>📋 마포구 복지시설 목록</h2>
      {data.map((item, idx) => {
        // 안전한 접근
        const name = item["시설명"] || item["﻿시설명"] || "이름 없음";
        const lat = item["위도"];
        const lng = item["경도"];

        return (
          <div key={idx}>
            <strong>{name}</strong> ({lat}, {lng})
          </div>
        );
      })}
    </div>
  );
}
