// src/components/common/MemberSyncProvider.jsx
import { useEffect } from "react";
import axios from "axios";
import useAuthStore from "../stores/useAuthStore";

export default function MemberSyncProvider() {
  
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        console.log("fetchMemberData 실행됨");
        const res = await axios.get("/api/myPage/info", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 200) {
          const { setAuth, ...rest } = useAuthStore.getState();
          setAuth({
            ...rest,
            memberImg: res.data.memberImg ?? null,
            memberName: res.data.memberName,
            // 필요 시 다른 데이터도 갱신
          });
        }
      } catch (err) {
        console.error("회원 정보 동기화 실패", err);
      }
    };

    if (token) {
      fetchMemberData();
    }
  }, [token]);

  return null; // 렌더링은 안 하고 효과만 실행
}
