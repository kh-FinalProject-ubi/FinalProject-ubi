import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // 실제로는 서버 응답에서 받아온 값 사용
    const dummyUser = {
      nickname: "재석",
      profileImg: "/assets/profile.png",
    };
    login(dummyUser);
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>로그인</h2>
      <button onClick={handleLogin}>더미 계정으로 로그인</button>
    </div>
  );
}
