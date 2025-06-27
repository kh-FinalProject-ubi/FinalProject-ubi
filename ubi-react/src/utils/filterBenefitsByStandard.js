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
  console.log("🧪 memberStandard:", memberStandard);

  if (showAll || !token) return list;

  const keywords = standardKeywordMap[String(memberStandard)];
  if (!keywords) return list;

  const isGeneral = memberStandard === "0" || memberStandard === "일반";

  return list.filter((item) => {
    const rawTargets = item.lifeNmArray;

    // lifeNmArray → 배열로 변환 + 공백 제거 + 문자열 보장
    const targets = Array.isArray(rawTargets)
      ? rawTargets
          .flatMap((t) => String(t).split(","))
          .map((s) => s.replace(/\s/g, "").trim())
      : typeof rawTargets === "string"
      ? rawTargets.split(",").map((s) => s.replace(/\s/g, "").trim())
      : [];

    if (isGeneral) {
      // 일반 사용자는 특수계층 키워드가 없는 것만 보여야 함
      const hasSpecialGroup = targets.some((t) =>
        [
          "노인",
          "노년",
          "청년",
          "아동",
          "영유아",
          "장애인",
          "임산부",
          "임신",
          "출산",
        ].includes(t)
      );

      if (hasSpecialGroup) {
        console.log("🚫 제외됨 (일반 제외 대상):", item.servNm, targets);
        return false;
      } else {
        console.log("✅ 포함됨 (일반 대상):", item.servNm, targets);
        return true;
      }
    } else {
      const match = targets.some((t) => keywords.includes(t));
      if (match) {
        console.log("✅ 포함됨 (매칭):", item.servNm, targets);
      } else {
        console.log("🚫 제외됨 (불일치):", item.servNm, targets);
      }
      return match;
    }
  });
}
