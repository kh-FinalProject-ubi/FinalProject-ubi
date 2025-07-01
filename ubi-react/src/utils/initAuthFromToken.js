import { jwtDecode } from "jwt-decode";
import useAuthStore from "../stores/useAuthStore";

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
      authority,
      role,
      address,
      regionCity,
      regionDistrict,
    } = decoded;

    useAuthStore.getState().setAuth({
      token,
      address,
      memberName,
      memberStandard,
      memberNo,
      authority,
      role,
      regionCity,
      regionDistrict,
    });

    console.log("✅ useAuthStore 재설정 완료");
  } catch (e) {
    console.error("❌ 토큰 디코딩 실패:", e);
  }
}
