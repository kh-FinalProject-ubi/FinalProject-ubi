/**
 * 시설 객체에서 다국어 키(FACLT_NM, 시설명 등)를 탐색해 값을 반환하는 함수
 * @param {object} facility - 시설 정보 객체
 * @param  {...string} keys - 가능한 키 이름들
 * @returns {string} - 첫 번째로 유효한 값 또는 '정보 없음'
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

export default function FacilityCard({ facility }) {
  const name = getField(facility, "시설명", "FACLT_NM");
  const address = getField(facility, "주소", "REFINE_ROADNM_ADDR");
  const tel = getField(facility, "전화번호", "DETAIL_TELNO");
  const capacity = getField(facility, "정원", "ENFLPSN_PSN_CAPA");

  return (
    <div className="facility-card">
      <h3>{name}</h3>
      <p>{address}</p>
      <p>전화번호: {tel}</p>
      <p>정원: {isNaN(capacity) ? capacity : `${capacity}명`}</p>
    </div>
  );
}
