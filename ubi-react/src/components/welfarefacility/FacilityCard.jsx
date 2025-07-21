import React from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/welfarefacility/FacilityCard.module.css";
import WelfareLikeButton from "../../components/welfareLike/WelfareLikeButton";
import useAuthStore from "../../stores/useAuthStore";
/**
 * 시설 객체에서 다국어 키(FACLT_NM, 시설명 등)를 탐색해 값을 반환하는 함수
 */

// ✅ 카테고리 매핑
/**
 * 카테고리 매핑 테이블
 */

const categoryMap = {
  체육시설: [
    "체육시설",
    "테니스장",
    "다목적경기장",
    "풋살장",
    "야구장",
    "축구장",
    "배구장",
    "농구장",
    "체육시설",
  ],
  요양시설: ["재가노인복지시설", "노인요양시설", "장기요양기관", "요양시설"],
  의료시설: [
    "장애인재활치료시설",
    "정신건강복지 지역센터",
    "성폭력피해보호시설",
    "의료시설",
  ],
  행정시설: [
    "건강가정지원센터",
    "다문화가족지원센터",
    "사회복지관",
    "자활시설",
    "행정시설",
  ],
};

/**
 * 다국어 키 대응 (공공 API 호환)
 */
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
 * 서비스 대상 자동 판별
 */
const getServiceTarget = (facility) => {
  const text = JSON.stringify(facility);
  if (text.includes("노인")) return "노인";
  if (text.includes("장애인")) return "장애인";
  if (text.includes("아동")) return "아동";
  if (text.includes("청소년") || text.includes("청년")) return "청소년";
  return "기타";
};

/**
 * 카테고리 자동 판별
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

export default function FacilityCard({
  facility,
  selectedCity,
  selectedDistrict,
}) {
  const auth = useAuthStore();
  const name =
    getField(facility, "facilityName", "시설명", "FACLT_NM", "facilityAddr") ||
    "이름 없음";

  const serviceTarget = getServiceTarget(facility);
  const category = getCategory(facility);

  return (
    <div className={styles.facilityCard}>
      <div className={styles.facilityCardRow}>
        <div className={styles.serviceTarget}>{serviceTarget}</div>
        <div className={styles.category}>{category}</div>
      </div>
      <WelfareLikeButton
        token={auth.token}
        facilityName={facility.facilityName}
        category={facility.category}
        regionCity={selectedCity} // 💡 여기!
        regionDistrict={selectedDistrict} // 💡 여기!
        description={facility.description}
        agency={facility.agency}
        apiUrl={facility.url}
        imageProfile={facility.imageProfile}
        lat={facility.lat}
        lng={facility.lng}
      />
      <div className={styles.facilityStatus}>
        <Link to={{ pathname: "/facility/detail" }} state={{ facility }}>
          {name}
        </Link>
      </div>
    </div>
  );
}
