import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import { extractRegionFromTaddress } from "../../utils/extractRegionFromTaddress";

// JWT 파싱 함수
function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const jsonString = new TextDecoder().decode(bytes);
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("❌ JWT 파싱 실패:", e);
    return {};
  }
}

export default function useLoginMember() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuth = useAuthStore((state) => state.setAuth);
  const auth = useAuthStore(); // Zustand 전체 상태

  const fetchMember = async () => {
    try {
      setLoading(true);

      const saved = JSON.parse(localStorage.getItem("auth-storage") || "{}");
      const token = saved?.state?.token || null;
      const jwtPayload = parseJwt(token);
      const taddress = jwtPayload?.taddress || null;

      if (auth?.memberNo && auth?.memberTaddress) {
        console.log("🧪 Zustand auth (완성):", auth);
        setMember(auth);
        setLoading(false);
        return;
      }

      const res = await axios.get("/api/member/info");
      console.log("🧩 서버 응답:", res.data);

      const { city: tempRegionCity, district: tempRegionDistrict } =
        extractRegionFromTaddress(taddress || "");

      const { city: regionCity, district: regionDistrict } =
        extractRegionFromTaddress(
          `${res.data.memberAddressCity} ${res.data.memberAddressDistrict}`
        );

      const authData = {
        token,
        address: res.data.address,
        memberImg: res.data.memberImg,
        memberStandard: res.data.memberStandard,
        memberNo: res.data.memberNo,
        authority: res.data.authority,
        memberNickname: res.data.memberNickname || res.data.memberName,
        role: res.data.authority === "2" ? "ADMIN" : "USER",
        regionCity,
        regionDistrict,
        tempRegionCity,
        tempRegionDistrict,
        memberTaddress: taddress,
      };

      setAuth(authData);
      setMember(authData);
    } catch (err) {
      console.warn("⚠️ 로그인 정보 불러오기 실패", err);
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMember(); // 초기 1회 실행
  }, []);

  return { member, loading, refetchMember: fetchMember }; // ✅ refetchMember 추가
}
