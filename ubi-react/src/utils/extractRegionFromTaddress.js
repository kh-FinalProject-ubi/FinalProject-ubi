export function extractRegionFromTaddress(taddress) {
  if (!taddress) return { city: null, district: null };

  const parts = taddress.split("^^^");
  const raw = parts[1] || "";
  const tokens = raw.trim().split(" ");

  const city = tokens[0] || null;
  const district = [
    "서울특별시",
    "부산광역시",
    "대구광역시",
    "인천광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",
    "세종특별자치시",
  ].includes(tokens[0])
    ? tokens[1] || null
    : null;

  return { city, district };
}
