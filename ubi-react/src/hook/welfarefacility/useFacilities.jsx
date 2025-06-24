// useFacilities.js

import { useState, useEffect } from "react";
import axios from "axios";
import useSelectedRegionStore from "./useSelectedRegionStore";

export function useFacilities(cityParam, districtParam) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    selectedCity: selectedCityFromStore,
    selectedDistrict: selectedDistrictFromStore,
  } = useSelectedRegionStore();

  // ✅ 외부에서 넘겨준 값이 있으면 우선 사용, 없으면 store, 최종적으로 기본값
  const city = cityParam || selectedCityFromStore || "서울특별시";
  const district = districtParam || selectedDistrictFromStore || "종로구";

  useEffect(() => {
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
  }, [city, district]);

  return { data, loading, error };
}
