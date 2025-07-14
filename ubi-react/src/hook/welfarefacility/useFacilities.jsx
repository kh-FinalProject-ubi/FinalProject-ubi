// 📁 src/hook/welfarefacility/useFacilities.js

import { useState, useEffect } from "react";
import axios from "axios";
import { normalizeRegion } from "../../utils/regionUtils";

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

    if (category === "체육시설" && city !== "서울특별시") {
      setData([]);
      return;
    }

    const fetchFacilities = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = "/api/facility";
        let params = { city, district };

        if (category && category !== "전체") {
          params.category = category;
        }

        if (city.includes("경기")) {
          url = "/api/gyeonggi-facility";
          params.apiType = apiType;
        } else if (city.includes("강원")) {
          url = "/api/gangwon-facility";
        } else if (city === "부산광역시") {
          url = "/api/busan-facility";
        } else if (city === "제주특별자치도") {
          url = "/api/jeju-facility";
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
        const normalized = normalizeFacilityDistricts(items, city);
        setData(normalized);
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

// 📌 공통 정규화 함수
export const normalizeFacilityDistricts = (facilities, city) => {
  return facilities.map((item) => {
    const rawDistrict =
      item.regionDistrict ||
      item.district ||
      item["시군구명"] ||
      item["SIGUNGU_NM"] ||
      item["SIGUNGU"] ||
      item["regionDistrict"] ||
      (item["REFINE_ROADNM_ADDR"] &&
        item["REFINE_ROADNM_ADDR"].split(" ")[1]) ||
      (item["address"] && item["address"].split(" ")[1]) ||
      "";

    const rawCity = item.regionCity || city;
    const { regionDistrict } = normalizeRegion(rawCity, rawDistrict);

    return {
      ...item,
      regionDistrict,
      district: regionDistrict, // 필터 일치용
    };
  });
};

export const categoryMap = {
  체육시설: ["테니스장", "다목적경기장", "체육", "체육시설"],
  요양시설: ["재가노인복지시설", "노인요양시설", "장기요양기관", "요양시설"],
  의료시설: ["장애인재활치료시설", "정신건강복지", "건강센터", "의료시설"],
  행정시설: [
    "건강가정지원센터",
    "다문화가족지원센터",
    "사회복지관",
    "자활시설",
    "행정시설",
  ],
};

export const isMatchServiceTarget = (facility, selectedType) => {
  if (selectedType === "전체") return true;

  const matchTable = {
    노인: ["노인"],
    청소년: ["청소년", "청년", "쉼터"],
    아동: ["아동", "유아", "보육"],
    장애인: ["장애인", "발달장애", "지체장애"],
  };

  const keywords = matchTable[selectedType] || [];

  const typeFields = [
    facility["시설명"],
    facility["facilityName"],
    facility["FACLT_NM"],
    facility["OPEN_FACLT_NM"],
    facility["시설종류명"],
    facility["시설종류상세명"],
    facility["상세유형"],
    facility["SVC_TYPE"],
    facility["category"],
    facility["type"],
  ];

  return keywords.some((keyword) =>
    typeFields.some((field) => field?.includes?.(keyword))
  );
};

export const getCombinedFacilities = (
  category,
  welfareData = [],
  sportsData = []
) => {
  if (category === "체육시설") {
    return Array.isArray(sportsData) ? sportsData : [];
  }
  return Array.isArray(welfareData) ? welfareData : [];
};

export const getFilteredFacilities = ({
  facilities,
  keyword,
  serviceType,
  category,
  selectedDistrict,
  selectedCity,
}) => {
  return facilities.filter((f) => {
    const name =
      f["facilityName"] ||
      f["시설명"] ||
      f["FACLT_NM"] ||
      f["OPEN_FACLT_NM"] ||
      "";

    const matchesDistrict =
      selectedCity === "제주특별자치도"
        ? selectedDistrict === "" || f["district"]?.trim() === selectedDistrict
        : true;

    const type =
      f["상세유형"] ||
      f["시설종류명"] ||
      f["SVC_TYPE"] ||
      f["category"] ||
      f["OPEN_FACLT_TYPE_DIV_NM"] ||
      "";

    const matchesKeyword = keyword === "" || name.includes(keyword);
    const matchesServiceType = isMatchServiceTarget(f, serviceType);
    const categoryKeywords = categoryMap[category] || [];
    const matchesCategory =
      category === "전체" ||
      categoryKeywords.some((target) => type?.includes(target));

    return (
      matchesKeyword && matchesServiceType && matchesCategory && matchesDistrict
    );
  });
};
