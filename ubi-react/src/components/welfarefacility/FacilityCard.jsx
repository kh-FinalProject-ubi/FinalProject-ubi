import React from "react";
import { Link } from "react-router-dom";

/**
 * 시설 객체에서 다국어 키(FACLT_NM, 시설명 등)를 탐색해 값을 반환하는 함수
 */

// ✅ 카테고리 매핑
const categoryMap = {
  체육시설: ["체육시설"],
  요양시설: ["재가노인복지시설", "노인요양시설", "장기요양기관"],
  의료시설: [
    "장애인재활치료시설",
    "정신건강복지 지역센터",
    "성폭력피해보호시설",
  ],
  행정시설: [
    "건강가정지원센터",
    "다문화가족지원센터",
    "사회복지관",
    "자활시설",
  ],
};

const getField = (facility, ...keys) => {
  for (const key of keys) {
    const value = facility?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return "정보 없음";
};

/**
 * 서비스 대상 판별 함수
 */
const getServiceTarget = (facility) => {
  const text = JSON.stringify(facility);
  if (text.includes("노인")) return "노인";
  if (text.includes("장애인")) return "장애인";
  if (text.includes("아동")) return "아동";
  if (text.includes("청소년")) return "청소년";
  return "기타";
};

/**
 * 카테고리 판별 함수
 */
const getCategory = (facility) => {
  const text = JSON.stringify(facility);
  for (const [categoryName, keywords] of Object.entries(categoryMap)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return categoryName;
    }
  }
  return "기타";
};

export default function FacilityCard({ facility }) {
  const name = getField(facility, "시설명", "FACLT_NM");
  const serviceTarget = getServiceTarget(facility);
  const category = getCategory(facility);

  return (
    <div className="facility-card p-3 border rounded-md shadow-sm hover:shadow-md transition duration-200 bg-white">
      <div className="mb-2 text-sm text-white bg-blue-500 px-2 py-1 rounded w-fit">
        {serviceTarget} {category}
      </div>

      <h3 className="text-lg font-semibold text-blue-600 hover:underline text-center">
        <Link to={{ pathname: "/facility/detail" }} state={{ facility }}>
          {name}
        </Link>
      </h3>
    </div>
  );
}
