import { jwtDecode } from "jwt-decode";
import useAuthStore from "../stores/useAuthStore";
import { extractRegionFromTaddress } from "./extractRegionFromTaddress";

export function initAuthFromToken() {
  const token = useAuthStore.getState().token;
  console.log("🧪 initAuthFromToken 시작. token:", token);

  if (!token) {
    console.warn("⚠️ Zustand에 토큰 없음");
    return;
  }

  try {
    const decoded = jwtDecode(token);
    console.log("✅ 디코딩 성공:", decoded);

    const {
      memberName,
      memberNo,
      memberStandard,
      memberNickname,
      memberImg,
      authority,
      role,
      address,
      regionCity,
      regionDistrict,
      taddress, // ✅ 새로 추가
    } = decoded;

    const { city: tempRegionCity, district: tempRegionDistrict } =
      extractRegionFromTaddress(taddress); // ✅ 파싱

    useAuthStore.getState().setAuth({
      token,
      memberName,
      memberNo,
      memberStandard,
      memberNickname,
      memberImg,
      authority,
      role,
      address,
      regionCity,
      regionDistrict,
      tempRegionCity,
      tempRegionDistrict,
    });

    console.log("✅ useAuthStore 재설정 완료");
    console.log("📦 decoded.taddress:", decoded.taddress);
  } catch (e) {
    console.error("❌ 토큰 디코딩 실패:", e);
  }
}
