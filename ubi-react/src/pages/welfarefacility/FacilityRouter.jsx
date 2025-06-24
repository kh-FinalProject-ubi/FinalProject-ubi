// 📁 src/pages/welfarefacility/FacilityRouter.jsx
import { useSearchParams } from "react-router-dom";
import MapoFacilities from "./FacilityRouter";
import FacilityDetailPage from "./FacilityDetailPage"; // 기존 API 방식

export default function FacilityRouter() {
  const [params] = useSearchParams();
  const city = params.get("city");
  const district = params.get("district");

  const isMapo = city === "서울특별시" && district === "마포구";

  return isMapo ? (
    <MapoFacilities />
  ) : (
    <FacilityDetailPage city={city} district={district} />
  );
}
