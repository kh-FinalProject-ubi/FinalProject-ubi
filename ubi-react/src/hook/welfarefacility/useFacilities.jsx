// 📁 src/hooks/useFacilities.js
import { useState, useEffect } from "react";
import axios from "axios";

/**
 * 지역 복지시설 데이터를 가져오는 훅
 * @param {string} city - 시도명
 * @param {string} district - 시군구명
 */
export function useFacilities(city, district) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || !district) return;

    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("/api/facility", {
          params: { city, district },
        });

        console.log("📦 원본 응답:", res.data);

        let items = [];

        // JSON 형태 1: 공공데이터포털 포맷 (data 배열)
        if (Array.isArray(res.data?.data)) {
          items = res.data.data;
        }
        // XML 변환 포맷: 공공데이터 xml → json 변환된 포맷
        else if (Array.isArray(res.data?.response?.body?.items?.item)) {
          items = res.data.response.body.items.item;
        }
        // 단순 배열 형태 (백엔드 커스텀 응답)
        else if (Array.isArray(res.data)) {
          items = res.data;
        }

        console.log("📋 최종 추출된 시설 목록:", items);
        setData(items);
      } catch (err) {
        console.error("❌ 복지시설 API 호출 실패:", err);
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
