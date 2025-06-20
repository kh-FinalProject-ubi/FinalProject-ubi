import React, { useState } from "react";
import useAuthStore from "../stores/useAuthStore";
// import "./LoginModal.css";

const LoginModal = ({ onClose }) => {
  const [memberId, setMemberId] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/member/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, memberPw }),
    });

    const data = await res.json();
    if (res.ok) {
      setAuth({
        token: data.token,
        address: data.address,
        memberName: data.memberName,
      });
      onClose();
    } else {
      alert(data.message || "로그인 실패");
    }
  };

  const handleKakaoLogin = () => {
    const KAKAO_REST_API_KEY = "카카오 REST API 키";
    const REDIRECT_URI = "http://localhost:3000/oauth/kakao/callback";
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoURL;
  };

  return (
    <div className="login-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
        <h2>로그인</h2>
        <form onSubmit={handleLogin}>
          <input
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
          <button type="submit">로그인</button>
        </form>
        <hr />
        <button onClick={handleKakaoLogin} className="kakao-btn">
          카카오로 로그인
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
