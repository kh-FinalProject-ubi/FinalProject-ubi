import { standardKeywordMap } from "./filterBenefitsByStandard";

// 🔹 지역명 정규화 함수 (특별시, 광역시, 도, 시, 구, 군 제거)
const normalize = (value) =>
  value?.replace(/(특별시|광역시|도|시|구|군)/g, "").trim();

/**
 * 복지 혜택 데이터에 모든 필터 적용
 */
export function applyAllFilters(data, options, authState) {
  const {
    keyword = "",
    serviceType = "전체",
    category = "전체",
    sortOrder = "latest",
    showAll = false,
  } = options;

  const { token, memberStandard, regionCity, regionDistrict } = authState;

  console.log("🧾 필터 옵션:", options);
  console.log("👤 사용자 상태:", authState);

  return (
    data
      // 🔹 1단계: 로그인 계층 필터링 (지자체복지혜택 + 청년 정책만)
      .filter((item) => {
        if (!token || showAll) return true;

        const applyStandardFilterTo = ["지자체복지혜택", "청년 정책"];
        if (!applyStandardFilterTo.includes(item.category)) return true;

        const keywords = standardKeywordMap[memberStandard];
        const targets = Array.isArray(item.lifeNmArray)
          ? item.lifeNmArray.flatMap((t) => t.split(",").map((s) => s.trim()))
          : typeof item.lifeNmArray === "string"
          ? item.lifeNmArray.split(",").map((s) => s.trim())
          : [];

        if (memberStandard === "일반" || memberStandard === "0") {
          const result = !targets.some((life) =>
            [
              "노인",
              "청년",
              "아동",
              "영유아",
              "장애인",
              "임산부",
              "출산",
              "임신",
            ].includes(life)
          );
          if (!result) console.log("🚫 제외됨 (일반 계층 제외):", item.title);
          return result;
        }

        const result = targets.some((t) => keywords.includes(t));
        if (!result) console.log("🚫 제외됨 (계층 불일치):", item.title);
        return result;
      })

      // 🔹 1.5단계: 지역 필터링 (normalize 비교)
      .filter((item) => {
        if (!token || showAll) return true;

        const itemCity = normalize(item.regionCity);
        const itemDistrict = normalize(item.regionDistrict);
        const userCity = normalize(regionCity);
        const userDistrict = normalize(regionDistrict);

        const result = itemCity === userCity && itemDistrict === userDistrict;

        if (!result) {
          console.log(
            `🚫 제외됨 (지역 불일치): ${item.title} → item: ${itemCity} ${itemDistrict}, user: ${userCity} ${userDistrict}`
          );
        }

        return result;
      })

      // 🔹 2단계: 서비스 대상 필터
      .filter((item) => {
        if (serviceType === "전체") return true;

        const matchKeyword = standardKeywordMap[serviceType];
        const targets = item.lifeNmArray || [];

        const result = Array.isArray(targets)
          ? targets.some((t) => matchKeyword?.includes(t))
          : false;

        if (!result) {
          console.log("🚫 제외됨 (서비스 대상 미일치):", item.title);
        }

        return result;
      })

      // 🔹 3단계: 카테고리 필터
      .filter((item) => {
        if (category === "전체") return true;

        const result = item.category === category;

        if (!result) {
          console.log("🚫 제외됨 (카테고리 불일치):", item.title);
        }

        return result;
      })

      // 🔹 4단계: 키워드 필터 (제목, 설명, 지역)
      .filter((item) => {
        if (!keyword.trim()) return true;

        const k = keyword.trim().toLowerCase();
        const result =
          item.title?.toLowerCase().includes(k) ||
          item.description?.toLowerCase().includes(k) ||
          item.region?.toLowerCase().includes(k);

        if (!result) {
          console.log("🚫 제외됨 (키워드 미포함):", item.title);
        }

        return result;
      })

      // 🔹 5단계: 정렬
      .sort((a, b) => {
        const aDate = new Date(a.startDate || "1970-01-01");
        const bDate = new Date(b.startDate || "1970-01-01");
        return sortOrder === "latest" ? bDate - aDate : aDate - bDate;
      })
  );
}
