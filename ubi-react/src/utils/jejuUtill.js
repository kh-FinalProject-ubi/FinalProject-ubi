export const categorizeByFacilityName = (name) => {
  if (!name) return "기타";
  if (/체육|경기장|수영장|운동장|야영장|스포츠|헬스/.test(name)) return "체육시설";
  if (/요양|재가노인|노인요양|장기요양|치매|실버/.test(name)) return "요양시설";
  if (/의료|재활|정신건강|치료센터|건강|병원|보건/.test(name)) return "의료시설";
  if (/지원센터|센터|사회복지관|다문화|가정|자활|복지관|행정/.test(name)) return "행정시설";
  return "기타";
};

export const preprocessWelfareData = (data, city) =>
  data.map((f) => {
    const address = f.address || f["주소"] || "";
    const name = f.facilityName || f["시설명"] || "";
    const district = city === "제주특별자치도" ? address.split(" ")[0] || "" : f.district || "";
    const category = f.category || categorizeByFacilityName(name);
    return { ...f, district, category };
  });