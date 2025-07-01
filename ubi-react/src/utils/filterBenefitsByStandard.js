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

  // 로그인 안 했거나 전체 보기면 전체 반환
  if (showAll || !token || !memberStandard) {
    console.log("✅ 필터 미적용 (로그인 안 됨 or 전체 보기)");
    return list;
  }

  const isGeneral = memberStandard === "0" || memberStandard === "일반";
  const keywords = standardKeywordMap[String(memberStandard)];

  if (!keywords) {
    console.log("⚠️ 알 수 없는 memberStandard:", memberStandard);
    return list;
  }

  return list.filter((item) => {
    const rawTargets = item.lifeNmArray;

    // lifeNmArray 전처리
    const targets = Array.isArray(rawTargets)
      ? rawTargets.flatMap((t) => String(t).split(",")).map((s) => s.trim())
      : typeof rawTargets === "string"
      ? rawTargets.split(",").map((s) => s.trim())
      : [];

    // 대상 정보 없음 → 포함
    if (targets.length === 0) {
      console.log("✅ 포함됨 (대상 정보 없음):", item.servNm);
      return true;
    }

    if (isGeneral) {
      // 일반 계층 → 특수 키워드가 있는 항목 제외
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
      // 특수 계층 → 키워드 매칭 여부
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
