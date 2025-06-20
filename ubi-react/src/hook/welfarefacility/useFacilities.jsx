// 📁 src/hooks/useFacilities.js
import { useState, useEffect } from "react";
import axios from "axios";

/**
 * 지역 기반 복지시설 데이터를 가져오는 커스텀 훅
 * @param {string} city - 시도명 (예: "서울특별시")
 * @param {string} district - 시군구명 (예: "성북구")
 * @returns {object} { data, loading, error }
 */
export function useFacilities(city, district) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 조건 없으면 실행하지 않음
    if (!city || !district) return;

    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("/api/facility", {
          params: { city, district },
        });
        setData(res.data);
      } catch (err) {
        console.error("시설 API 호출 실패:", err);
        setError(err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [city, district]);

  return { data, loading, error };
}
