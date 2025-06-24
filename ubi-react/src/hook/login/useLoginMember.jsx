// 📁 src/hook/useLoginMember.js
import { useState, useEffect } from "react";
import axios from "axios";

export default function useLoginMember() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await axios.get("/api/member/info");
        setMember(res.data);
      } catch (err) {
        console.warn("⚠️ 로그인 정보 불러오기 실패", err);
        setMember(null); // 비로그인 처리
      } finally {
        setLoading(false); // ✅ 반드시 실행됨
      }
    };

    fetchMember();
  }, []);

  return { member, loading };
}
