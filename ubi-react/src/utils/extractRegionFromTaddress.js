import cityDistrictMap from "../constants/cityDistrictMap";

export function extractRegionFromTaddress(taddress) {
  if (!taddress) return { city: null, district: null };

  const parts = taddress.split("^^^");
  const raw = parts[1] || "";
  const tokens = raw.trim().split(" ");

  // ✅ '경남' → '경상남도' 등 매핑 사전 정의
  const cityAliasMap = {
    서울: "서울특별시",
    경기: "경기도",
    인천: "인천광역시",
    부산: "부산광역시",
    대구: "대구광역시",
    광주: "광주광역시",
    대전: "대전광역시",
    울산: "울산광역시",
    세종: "세종특별자치시",
    강원: "강원도",
    충북: "충청북도",
    충남: "충청남도",
    전북: "전라북도",
    전남: "전라남도",
    경북: "경상북도",
    경남: "경상남도",
    제주: "제주특별자치도",
  };

  // ✅ 별칭 처리
  const normalizedTokens = tokens.map((t) =>
    cityAliasMap[t] ? cityAliasMap[t] : t
  );

  for (const [city, districts] of Object.entries(cityDistrictMap)) {
    for (const district of districts) {
      const cityMatch = normalizedTokens.find(
        (t) => city.startsWith(t) || t.startsWith(city)
      );
      const districtMatch = normalizedTokens.find(
        (t) => district.startsWith(t) || t.startsWith(district)
      );
      if (cityMatch && districtMatch) {
        return { city, district };
      }
    }
  }

  return { city: null, district: null }; // 못 찾은 경우
}
