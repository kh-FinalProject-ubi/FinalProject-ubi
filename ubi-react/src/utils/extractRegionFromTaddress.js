import cityDistrictMap from "../constants/cityDistrictMap";

export function extractRegionFromTaddress(taddress) {
  if (!taddress) return { city: null, district: null };

  const parts = taddress.split("^^^");
  const raw = parts[1] || "";
  const tokens = raw.trim().split(" ");

  for (const [city, districts] of Object.entries(cityDistrictMap)) {
    for (const district of districts) {
      const cityMatch = tokens.find(
        (t) => city.startsWith(t) || t.startsWith(city)
      );
      const districtMatch = tokens.find(
        (t) => district.startsWith(t) || t.startsWith(district)
      );
      if (cityMatch && districtMatch) {
        return { city, district };
      }
    }
  }

  return { city: null, district: null }; // 못 찾은 경우
}
