// ✅ WelfareFacilityModal.jsx (복지시설 선택 모달)

import React, { useEffect, useState } from "react";
import { useFacilities } from "../../hook/welfarefacility/useFacilities";
import { useSportsFacilities } from "../../hook/welfarefacility/useSportsFacilities";
import useSelectedRegionStore from "../../hook/welfarefacility/useSelectedRegionStore";
import useLoginMember from "../../hook/login/useLoginMember";
import { data } from "jquery";
import useAuthStore from "../../stores/useAuthStore";

export default function WelfareFacilityModal({ onSelect }) {
    const { address } = useAuthStore(); // ✅ 회원 주소
  const { member, loading: memberLoading } = useLoginMember();
  const { selectedCity: selectedCityFromStore, selectedDistrict: selectedDistrictFromStore } = useSelectedRegionStore();

  const [region, setRegion] = useState({ city: "", district: "" });
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("전체");
  const [serviceType, setServiceType] = useState("전체");

  const categoryMap = {
    체육시설: ["체육시설", "테니스장", "다목적경기장"],
    요양시설: ["재가노인복지시설", "노인요양시설", "장기요양기관"],
    의료시설: ["장애인재활치료시설", "정신건강복지 지역센터"],
    행정시설: ["건강가정지원센터", "다문화가족지원센터", "사회복지관", "자활시설"],
  };

  const isMatchServiceTarget = (facility, selectedType) => {
    if (selectedType === "전체") return true;
    const matchTable = {
      노인: ["노인"],
      청소년: ["청소년", "청년"],
      아동: ["아동"],
      장애인: ["장애인"],
    };
    const keywords = matchTable[selectedType] || [];
    const typeFields = [
      facility["시설종류명"],
      facility["상세유형"],
      facility["SVC_TYPE"],
      facility["category"],
      facility["type"],
    ];
    return keywords.some((keyword) => typeFields.some((field) => field?.includes(keyword)));
  };
  useEffect(() => {
  if (data.length > 0) {
    console.log("✅ facility 샘플:", data[0]);
  }
}, [data]);

  useEffect(() => {
    if (!memberLoading) {
      const city = member?.memberAddressCity || selectedCityFromStore || "서울특별시";
      const district = member?.memberAddressDistrict || selectedDistrictFromStore || "종로구";
      setRegion({ city, district });
    }
  }, [member, memberLoading, selectedCityFromStore, selectedDistrictFromStore]);

  const { data: welfareData, loading: welfareLoading } = useFacilities(region.city, region.district);
  const { data: sportsData, loading: sportsLoading } = useSportsFacilities(region.city, region.district);

  const loading = welfareLoading || sportsLoading;

  // ✅ 주소 비교 준비
  const regionFull = (region.city + region.district).replace(/\s/g, "");
  const userFull = (address || "").replace(/\s/g, "");

  
  const combinedFacilities = [...welfareData, ...sportsData]; // 데이터 합치기

  

  const filteredFacilities = combinedFacilities.filter((f) => {
    const name = f["시설명"] || f["FACLT_NM"] || f["facilityName"] || ""; // 시설명 
    const type = f["상세유형"] || f["시설종류명"] || f["SVC_TYPE"] || f["category"] || ""; // 시설유형
    const matchesKeyword = keyword === "" || name.includes(keyword);
    const matchesServiceType = isMatchServiceTarget(f, serviceType);// 삭제
    const categoryKeywords = categoryMap[category] || []; //유형 키워드 
    const matchesCategory = category === "전체" || categoryKeywords.some((target) => type?.includes(target));
   
   const facilityAddr =
  f["FACLT_ADDR"] || f["시설주소"] || f["REFINE_ROADNM_ADDR"] || f["ADDR"] || f["facilityAddr"] || "";

const cleanFacilityAddr = facilityAddr.replace(/\s/g, "");

// 정확히 같은 지역인지 검사
// const isSameRegion = cleanFacilityAddr.includes(userFull); // 또는 === 으로 더 엄격히

   //const isSameRegion = userFull === regionFull;  // 🧩 또는 === 로 완전 일치 비교 가능
console.log(userFull); // 서울특별시강남구 표시
console.log(regionFull); // 서울특별시종로구 표시 
console.log(facilityAddr); 

    return matchesKeyword && matchesServiceType && matchesCategory&& isSameRegion;;
  });

  return (
    <div className="facility-search-container">
      <h2>복지시설 선택</h2>
      <input
        type="text"
        placeholder="시설명 검색"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {filteredFacilities.map((facility, idx) => {
        const name = facility["시설명"] || facility["FACLT_NM"] || facility["facilityName"] || "시설";
      const serviceId =
  facility["시설코드"] ||
  "UNKNOWN_ID";

        return (
          <div
            key={`${name}-${idx}`}
            onClick={() => onSelect(name, serviceId)}
            style={{ cursor: "pointer", padding: "10px", borderBottom: "1px solid #ccc" }}
          >
            {name} (ID: {serviceId})
          </div>
        );
      })}
    </div>
  );
}