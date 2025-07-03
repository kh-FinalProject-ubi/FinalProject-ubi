import { useMemo } from "react";
import { standardKeywordMap } from "./filterBenefitsByStandard";

// 🔹 계층 필터 적용 대상 카테고리
const FILTERABLE_CATEGORIES = ["지자체복지혜택", "청년 정책"];
const GENERAL_EXCLUDE_KEYWORDS = [
  "노인",
  "노년",
  "청년",
  "아동",
  "영유아",
  "장애인",
  "임산부",
  "임신",
  "출산",
];

function matchesStandard(item, memberStandard) {
  const keywords = standardKeywordMap[memberStandard];
  if (!keywords) return true; // 필터 없음 처리

  const rawTargets = item.lifeNmArray;
  const targets = Array.isArray(rawTargets)
    ? rawTargets.flatMap((t) => t.split(",").map((s) => s.trim()))
    : typeof rawTargets === "string"
    ? rawTargets.split(",").map((s) => s.trim())
    : [];

  if (targets.length === 0 || targets.every((t) => !t)) return true;

  if (memberStandard === "일반" || memberStandard === "0") {
    return !targets.some((t) => GENERAL_EXCLUDE_KEYWORDS.includes(t));
  }

  return targets.some((t) => keywords.includes(t));
}

function matchesRegion(item, userCity, userDistrict) {
  const itemCity = item.regionCity?.trim();
  const itemDistrict = item.regionDistrict?.trim();

  const cityMatch = itemCity === userCity?.trim();
  if (!cityMatch) return false;

  return !itemDistrict || itemDistrict === userDistrict?.trim();
}

function matchesServiceType(item, serviceType) {
  if (serviceType === "전체") return true;
  const matchKeywords = standardKeywordMap[serviceType];
  const targets = item.lifeNmArray || [];

  if (!Array.isArray(targets) || targets.length === 0) return true;
  return targets.some((t) => matchKeywords.includes(t));
}

function normalizeCategory(itemCategory) {
  if (itemCategory.includes("구인")) return "구인";
  if (["서울시 복지", "청년 정책", "지자체복지혜택"].includes(itemCategory))
    return "복지 혜택";
  return "기타";
}

function matchesCategory(item, selectedCategory) {
  if (selectedCategory === "전체") return true;
  return normalizeCategory(item.category) === selectedCategory;
}

function matchesKeyword(item, keyword) {
  if (!keyword.trim()) return true;
  const k = keyword.toLowerCase().trim();

  return (
    item.title?.toLowerCase().includes(k) ||
    item.description?.toLowerCase().includes(k) ||
    item.region?.toLowerCase().includes(k)
  );
}

function sortByDate(a, b, order = "latest") {
  const aDate = new Date(a.startDate || "1970-01-01");
  const bDate = new Date(b.startDate || "1970-01-01");
  return order === "latest" ? bDate - aDate : aDate - bDate;
}

/**
 * ✅ 복지 필터 통합 적용 함수
 */
export function applyAllFilters(data, options, authState) {
  const {
    keyword = "",
    serviceType = "전체",
    category = "전체",
    sortOrder = "latest",
    showAll = false,
  } = options;

  const {
    token,
    memberStandard,
    regionCity = "서울특별시", // 기본값
    regionDistrict = "종로구",
  } = authState;

  return data
    .filter((item) => {
      if (!token || showAll) return true;
      if (!FILTERABLE_CATEGORIES.includes(item.category)) return true;
      return matchesStandard(item, memberStandard);
    })
    .filter((item) => {
      if (!token || showAll) return true;
      return matchesRegion(item, regionCity, regionDistrict);
    })
    .filter((item) => matchesServiceType(item, serviceType))
    .filter((item) => matchesCategory(item, category))
    .filter((item) => matchesKeyword(item, keyword))
    .sort((a, b) => sortByDate(a, b, sortOrder));
}
