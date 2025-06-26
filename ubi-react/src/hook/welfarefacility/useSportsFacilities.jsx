import { useEffect, useState } from "react";
import axios from "axios";

/**
 * 체육시설 데이터를 가져오는 커스텀 훅
 * @param {string} city - 시도명
 * @param {string} district - 구/군명
 * @returns {object} { data, loading }
 */
export function useSportsFacilities(city, district) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!district) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/sports-facility", {
          params: { city, district },
        });

        // ✅ Spring Boot에서 JSON으로 파싱해 넘겨준 리스트를 바로 사용
        setData(res.data); // SportsFacility DTO[] 형태
      } catch (err) {
        console.error("체육시설 API 오류:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city, district]);

  return { data, loading };
}
