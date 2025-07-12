import React, { useState } from "react";
import useAuthStore from "../stores/useAuthStore";
import { useNavigate, Link } from "react-router-dom";

const LoginPage = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const [mode, setMode] = useState("login"); // "login" | "find-id" | "find-pw"
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, memberPw }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.suspensionNotice) {
          alert(data.suspensionNotice);
        }
        setAuth({
          token: data.token,
          address: data.address,
          memberName: data.memberName,
          memberStandard: data.memberStandard,
          memberNickname: data.memberNickname,
          memberNo: data.memberNo,
          memberImg: data.memberImg,
          authority: data.authority,
          role: data.authority === "2" ? "ADMIN" : "USER",
        });
        navigate("/");
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (err) {
      console.error("로그인 오류", err);
      alert("오류가 발생했습니다.");
    }
  };

  const handleKakaoLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
  };

  if (mode === "find-id") {
    return <FindAccount type="id" onBack={() => setMode("login")} />;
  }

  if (mode === "find-pw") {
    return <FindAccount type="pw" onBack={() => setMode("login")} />;
  }

  return (
    <div className="login-page-container">
      <main className="login-main-content">
        {mode === "login" ? (
          <div className="login-form-container">
            <h3>로그인</h3>
            <form onSubmit={handleLogin}>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="아이디"
              />
              <input
                type="password"
                value={memberPw}
                onChange={(e) => setMemberPw(e.target.value)}
                placeholder="비밀번호"
              />
              <button type="submit" className="login-btn">
                로그인
              </button>
            </form>

            <button onClick={handleKakaoLogin} className="kakao-login-btn">
              카카오로 로그인하기
            </button>

            <div className="find-account-link">
            <Link to="/login/find-id">
  <button>아이디 찾기</button>
</Link>
<Link to="/login/find-pw">
  <button>비밀번호 찾기</button>
</Link>
            </div>
          </div>
        ) : (
          <FindAccount onBack={() => setMode("login")} />
        )}
      </main>
    </div>
  );
};

export default LoginPage;
