import { useEffect, useState } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

const usePopularBenefits = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    // ✅ 토큰이 있으면 헤더에 포함, 없어도 요청은 보냄
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios
      .get("/api/welfare/popular", { headers })
      .then((res) => {
        console.log("🎯 인기 복지 응답 데이터:", res.data);
        setData(res.data);
      })
      .catch((err) => console.error("❌ 인기 복지 조회 실패", err))
      .finally(() => setLoading(false));
  }, [token]);

  return { data, loading };
};

export default usePopularBenefits;
