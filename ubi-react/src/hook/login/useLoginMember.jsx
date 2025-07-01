import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

export default function useLoginMember() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await axios.get("/api/member/info");

        console.log("멤버 정보:", res.data);

        // Zustand에 로그인 상태 복구
        const saved = JSON.parse(localStorage.getItem("auth-storage") || "{}");

        setAuth({
          token: saved.state?.token || null,
          address: res.data.address,
          memberName: res.data.memberName,
          memberStandard: res.data.memberStandard,
          memberNo: res.data.memberNo,
          authority: res.data.authority,
          role: res.data.authority === "2" ? "ADMIN" : "USER",
          regionCity: res.data.regionCity,
          regionDistrict: res.data.regionDistrict,
        });

        setMember(res.data);
      } catch (err) {
        console.warn("로그인 정보 불러오기 실패", err);
        setMember(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, []);

  return { member, loading };
}
