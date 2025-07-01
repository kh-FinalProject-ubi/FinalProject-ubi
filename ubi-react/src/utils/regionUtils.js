export const normalizeSido = (rawSido) => {
  const map = {
    서울: "서울특별시",
    부산: "부산광역시",
    대구: "대구광역시",
    인천: "인천광역시",
    광주: "광주광역시",
    대전: "대전광역시",
    울산: "울산광역시",
    세종: "세종특별자치시",
    경기: "경기도",
    강원: "강원특별자치도",
    전북: "전북특별자치도",
    전남: "전라남도",
    충북: "충청북도",
    충남: "충청남도",
    경북: "경상북도",
    경남: "경상남도",
    제주: "제주특별자치도",
  };
  return map[rawSido] || rawSido || "";
};

export const normalizeSigungu = (rawSigungu) => {
  const map = {
    수원시: "수원특례시",
    고양시: "고양특례시",
    용인시: "용인특례시",
    창원시: "창원특례시",
    성남시: "성남특례시",
  };
  return map[rawSigungu] || rawSigungu || "";
};

// ✅ undefined 방지 및 안전한 조합 처리
export const normalizeRegion = (rawCity, rawDistrict) => {
  const regionCity = normalizeSido(rawCity);
  const regionDistrict = normalizeSigungu(rawDistrict);
  const region = regionDistrict
    ? `${regionCity} ${regionDistrict}`
    : regionCity;
  return { regionCity, regionDistrict, region };
};

export const mapCleanFullName = (fullName) => {
  const tokens = fullName.split(" ");
  if (tokens.length < 2) return fullName;
  const [sido, sigungu] = tokens;
  return `${normalizeSido(sido)} ${normalizeSigungu(sigungu)}`.trim();
};
