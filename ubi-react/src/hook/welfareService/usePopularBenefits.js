import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

const usePopularBenefits = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return; // 🔐 토큰 없으면 요청하지 않음

    axios
      .get("/api/welfare/popular", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("🎯 인기 복지 응답 데이터:", res.data); // ✅ 응답 확인
        setData(res.data);
      })
      .catch((err) => console.error("❌ 인기 복지 조회 실패", err))
      .finally(() => setLoading(false));
  }, [token]); // 🔁 token 변경 감지 후 실행

  return { data, loading };
};

export default usePopularBenefits;
