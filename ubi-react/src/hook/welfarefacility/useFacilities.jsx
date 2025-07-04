// 📁 src/hook/welfarefacility/useFacilities.js

import { useState, useEffect } from "react";
import axios from "axios";

export function useFacilities(
  apiType = "old",
  category = "전체",
  city,
  district
) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city || !district) return;

    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "/api/facility";
        let params = { city, district };

        //  서울용 category 파라미터 추가
        if (category && category !== "전체") {
          params.category = category;
        }

        //  경기도 API는 apiType 필요
        if (city.includes("경기")) {
          url = "/api/gyeonggi-facility";
          params.apiType = apiType;
        } else if (city.includes("강원")) {
          url = "/api/gangwon-facility";
        }
        //  부산광역시 추가
        else if (city === "부산광역시") {
          url = "/api/busan-facility";
          if (category && category !== "전체") {
            params.category = category;
          }
        }

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
  }, [city, district, apiType, category]);

  return { data, loading, error };
}
