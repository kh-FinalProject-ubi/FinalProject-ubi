import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore"; // ✅ zustand import

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth); // ✅ zustand setter

  const handleLogin = () => {
    const dummyUser = {
      token: "dummy-token",
      memberName: "재석",
      address: "서울특별시^^^강남구^^^논현동 123",
      memberStandard: "청년+장애인",
      memberImg: "/resources/profile/default_user.png", // ✅ 프로필 이미지 경로
    };

    setAuth(dummyUser);
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>로그인</h2>
      <button onClick={handleLogin}>더미 계정으로 로그인</button>
    </div>
  );
}
