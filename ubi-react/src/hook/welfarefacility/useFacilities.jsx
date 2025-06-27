import { useState, useEffect } from "react";
import axios from "axios";

export function useFacilities(city, district, apiType = "old") {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || !district) return;

    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ "경기" 또는 "경기도" 포함되면 경기도 전용 API 사용
        const isGyeonggi = city.includes("경기");

        const url = isGyeonggi ? "/api/gyeonggi-facility" : "/api/facility";

        const params = isGyeonggi
          ? { city, district, apiType } // 경기도 API는 apiType 필요
          : { city, district }; // 기존 API는 필요 없음

        const res = await axios.get(url, { params });

        console.log("📦 원본 응답:", res.data);

        let items = [];

        if (Array.isArray(res.data?.data)) {
          items = res.data.data;
        } else if (Array.isArray(res.data?.response?.body?.items?.item)) {
          items = res.data.response.body.items.item;
        } else if (Array.isArray(res.data)) {
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
  }, [city, district, apiType]);

  return { data, loading, error };
}
