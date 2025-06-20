import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

const KakaoCallback = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    fetch(`/api/member/kakao?code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        setAuth({
          token: data.token,
          address: data.address,
          memberName: data.memberName,
        });
        navigate("/");
      })
      .catch((err) => {
        console.error("카카오 로그인 실패", err);
        navigate("/login");
      });
  }, []);

  return <div>카카오 로그인 중입니다...</div>;
};

export default KakaoCallback;
