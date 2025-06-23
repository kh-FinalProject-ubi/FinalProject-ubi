// useFacilities.js

import { useState, useEffect } from "react";
import axios from "axios";
import useSelectedRegionStore from "./useSelectedRegionStore";

export function useFacilities() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 선택된 지역 store에서 가져옴
  const { selectedCity: city, selectedDistrict: district } =
    useSelectedRegionStore();

  useEffect(() => {
    // 🔐 유효성 검사
    if (!city || !district) {
      console.warn("🚫 주소가 없어 복지시설을 불러올 수 없습니다.");
      return;
    }

    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("/api/facility", {
          params: { city, district },
        });

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
  }, [city, district]); // ✅ 선택 지역이 바뀔 때마다 실행

  return { data, loading, error };
}
