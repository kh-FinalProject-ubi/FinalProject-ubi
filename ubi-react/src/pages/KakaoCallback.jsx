import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

const KakaoCallback = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");
    const kakaoId = url.searchParams.get("kakaoId");

    if (token) {
      // ✅ 토큰으로 사용자 정보 조회
      fetch("/api/member/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("사용자 정보 조회 실패");
          return res.json();
        })
        .then((data) => {
          setAuth({
            token,
            memberName: data.memberName,
            address: data.address,
            memberNo: data.memberNo,
          });
          navigate("/");
        })
        .catch((err) => {
          console.error(err);
          alert("사용자 정보 조회 실패");
          navigate("/");
        });
    } else if (kakaoId) {
      // 신규 사용자
      localStorage.setItem("kakaoId", kakaoId);
      navigate("/signup");
    } else {
      alert("카카오 로그인 실패");
      navigate("/");
    }
  }, []);

  return <div>카카오 로그인 처리 중입니다...</div>;
};

export default KakaoCallback;
