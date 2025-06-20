export default function FacilityCard({ facility }) {
  return (
    <div className="facility-card">
      <h3>{facility.FACLT_NM}</h3>
      <p>{facility.REFINE_ROADNM_ADDR}</p>
      <p>전화번호: {facility.DETAIL_TELNO}</p>
      <p>정원: {facility.ENFLPSN_PSN_CAPA}명</p>
    </div>
  );
}
