import cityDistrictMap from "../constants/cityDistrictMap";

console.log("📦 cityDistrictMap loaded:", !!cityDistrictMap);

export function extractRegionFromTaddress(taddress) {
  console.log("🔍 extractRegionFromTaddress called with:", taddress);

  if (!taddress) return { city: null, district: null };

  const parts = taddress.split("^^^");
  const raw = parts[1] || "";
  const tokens = raw.trim().split(" ");
  console.log("📦 tokens:", tokens);

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
    강원: "강원특별자치도",
    충북: "충청북도",
    충남: "충청남도",
    전북: "전북특별자치도",
    전남: "전라남도",
    경북: "경상북도",
    경남: "경상남도",
    제주: "제주특별자치도",
  };

  const normalizedTokens = tokens.flatMap((t) => {
    const full = cityAliasMap[t];
    return full ? [t, full] : [t];
  });
  console.log("📦 normalizedTokens:", normalizedTokens);

  for (const [city, districts] of Object.entries(cityDistrictMap)) {
    const hasCity = normalizedTokens.includes(city);
    const matchedDistrict = districts.find((d) => normalizedTokens.includes(d));

    if (hasCity && matchedDistrict) {
      console.log("✅ 정확 매칭 성공:", { city, district: matchedDistrict });
      return { city, district: matchedDistrict };
    }
  }

  // fallback (느슨하게 탐색)
  for (const [city, districts] of Object.entries(cityDistrictMap)) {
    const cityMatch = normalizedTokens.find(
      (t) => city.startsWith(t) || t.startsWith(city)
    );
    const districtMatch = districts.find((district) =>
      normalizedTokens.some(
        (t) => district.startsWith(t) || t.startsWith(district)
      )
    );

    if (cityMatch && districtMatch) {
      console.log("✅ fallback 매칭 성공:", city, districtMatch);

      return { city, district: districtMatch };
    }
  }
  console.error("⛔ 최종 매칭 실패");

  return { city: null, district: null };
}
