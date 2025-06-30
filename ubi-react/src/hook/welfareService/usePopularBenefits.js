import { useEffect, useState } from "react";
import axios from "axios";

const usePopularBenefits = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/welfare/popular")
      .then((res) => setData(res.data))
      .catch((err) => console.error("인기 복지 조회 실패", err))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};

export default usePopularBenefits;
