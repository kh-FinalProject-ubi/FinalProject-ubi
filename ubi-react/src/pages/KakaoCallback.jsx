import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { normalizeSido, normalizeSigungu } from "../utils/regionUtils";

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
        credentials: "include", // 추가!
      })
        .then((res) => {
          if (!res.ok) throw new Error("사용자 정보 조회 실패");
          return res.json();
        })
        .then((data) => {
          const parts = data.address?.split("^^^");
          const baseAddress = parts.length >= 2 ? parts[1] : data.address;
          const tokens = baseAddress?.trim()?.split(" ") || [];

          const regionCity =
            tokens.length >= 1 ? normalizeSido(tokens[0]) : null;
          const regionDistrict =
            tokens.length >= 2 ? normalizeSigungu(tokens[1]) : null;

          setAuth({
            token,
            memberName: data.memberName,
            address: baseAddress,
            memberNo: data.memberNo,
            memberStandard: data.memberStandard,
            authority: data.authority,
            regionCity,
            regionDistrict,
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
