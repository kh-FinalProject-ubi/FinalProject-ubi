// 📁 src/utils/facilityFilterUtil.js

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

export const getCombinedFacilities = (category, welfareData = [], sportsData = []) => {
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
      f["상세유형"] || f["시설종류명"] || f["SVC_TYPE"] || f["category"] || "";

    const matchesKeyword = keyword === "" || name.includes(keyword);
    const matchesServiceType = isMatchServiceTarget(f, serviceType);
    const categoryKeywords = categoryMap[category] || [];
    const matchesCategory =
      category === "전체" ||
      categoryKeywords.some((target) => type?.includes(target));

    return (
      matchesKeyword &&
      matchesServiceType &&
      matchesCategory &&
      matchesDistrict
    );
  });
};
