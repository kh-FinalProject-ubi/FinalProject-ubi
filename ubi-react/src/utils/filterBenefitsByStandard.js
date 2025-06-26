export const standardKeywordMap = {
  노인: ["노인", "노년"],
  청년: ["청년"],
  아동: ["아동", "영유아"],
  장애인: ["장애인"],
  "노인+장애인": ["노인", "장애인", "노년"],
  "청년+장애인": ["청년", "장애인"],
  "아동+장애인": ["아동", "영유아", "장애인"],
  임산부: ["임산부", "임신", "출산"],
  "임산부+장애인": ["임산부", "임신", "출산", "장애인"],
  "임산부+청년": ["임산부", "청년"],
  "임산부+아동": ["임산부", "아동", "영유아"],
  "임산부+노인": ["임산부", "노인", "노년"],
  "임산부+노인+장애인": ["임산부", "노인", "장애인", "노년"],
};

export function filterBenefitsByStandard(list, memberStandard, token, showAll) {
  console.log("memberStandard:", memberStandard);

  if (showAll || !token) return list;

  const keyword = standardKeywordMap[String(memberStandard)];
  if (!keyword) return list;

  if (memberStandard === "0" || memberStandard === "일반") {
    return list.filter((item) => {
      const rawTargets = item.lifeNmArray;

      const targets = Array.isArray(rawTargets)
        ? rawTargets.flatMap((t) => t.split(",").map((s) => s.trim()))
        : typeof rawTargets === "string"
        ? rawTargets.split(",").map((s) => s.trim())
        : [];

      const hasSpecialGroup = targets.some((life) =>
        [
          "노인",
          "청년",
          "아동",
          "장애인",
          "영유아",
          "임산부",
          "출산",
          "임신",
        ].includes(life)
      );

      if (hasSpecialGroup) {
        console.log("🚫 제외됨:", item.servNm, targets);
      } else {
        console.log("✅ 포함됨:", item.servNm, targets);
      }

      return !hasSpecialGroup;
    });
  }

  const keywords = Array.isArray(keyword) ? keyword : [keyword];

  return list.filter((item) => {
    const rawTargets = item.lifeNmArray;

    const targets = Array.isArray(rawTargets)
      ? rawTargets.flatMap((t) => t.split(",").map((s) => s.trim()))
      : typeof rawTargets === "string"
      ? rawTargets.split(",").map((s) => s.trim())
      : [];

    if (targets.length === 0 || targets.every((t) => t === "")) {
      console.log("✅ 포함됨 (정보 없음):", item.servNm, targets);
      return true;
    }

    const match = targets.some((life) => keywords.includes(life));
    if (match) {
      console.log("✅ 포함됨 (매칭됨):", item.servNm, targets);
    } else {
      console.log("🚫 제외됨:", item.servNm, targets);
    }
    return match;
  });
}
