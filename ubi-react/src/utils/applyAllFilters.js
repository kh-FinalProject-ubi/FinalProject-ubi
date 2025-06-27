import { standardKeywordMap } from "./filterBenefitsByStandard";

export function applyAllFilters(data, options, authState) {
  const {
    keyword = "",
    serviceType = "전체",
    category = "전체",
    sortOrder = "latest",
    showAll = false,
  } = options;

  const { token, memberStandard, regionCity, regionDistrict } = authState;

  return (
    data
      // 🔹 1단계: 로그인 필터링 (memberStandard + showAll)
      .filter((item) => {
        if (!token || showAll) return true;

        const keywords = standardKeywordMap[memberStandard];
        if (!keywords) return true;

        const targets = Array.isArray(item.lifeNmArray)
          ? item.lifeNmArray.flatMap((t) => t.split(",").map((s) => s.trim()))
          : typeof item.lifeNmArray === "string"
          ? item.lifeNmArray.split(",").map((s) => s.trim())
          : [];

        // 일반 유저: 특별 계층 혜택 제외
        if (memberStandard === "일반" || memberStandard === "0") {
          return !targets.some((life) =>
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
        }

        // 특정 계층 필터링
        return targets.some((t) => keywords.includes(t));
      })

      // 🔹 2단계: 서비스 대상 (serviceType 필터)
      .filter((item) => {
        if (serviceType === "전체") return true;

        const matchKeyword = standardKeywordMap[serviceType];
        const targets = item.lifeNmArray || [];

        return Array.isArray(targets)
          ? targets.some((t) => matchKeyword?.includes(t))
          : false;
      })

      // 🔹 3단계: 카테고리 필터
      .filter((item) => {
        if (category === "전체") return true;
        return item.category === category;
      })

      // 🔹 4단계: 키워드 필터 (제목, 설명, 지역)
      .filter((item) => {
        if (!keyword.trim()) return true;

        const k = keyword.trim().toLowerCase();
        return (
          item.title?.toLowerCase().includes(k) ||
          item.description?.toLowerCase().includes(k) ||
          item.region?.toLowerCase().includes(k)
        );
      })

      // 🔹 5단계: 정렬
      .sort((a, b) => {
        const aDate = new Date(a.startDate || "1970-01-01");
        const bDate = new Date(b.startDate || "1970-01-01");

        return sortOrder === "latest" ? bDate - aDate : aDate - bDate;
      })
  );
}
