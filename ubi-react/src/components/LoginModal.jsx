import React, { useState } from "react";
import useAuthStore from "../stores/useAuthStore";
import useModalStore from "../stores/useModalStore";

const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal } = useModalStore();
  const [memberId, setMemberId] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  if (!isLoginModalOpen) return null; // 열리지 않으면 렌더 안함

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
        memberStandard: data.memberStandard, // ✅ 이 줄 추가
        memberNo: data.memberNo,
        authority: data.authority,
        role: data.authority === "2" ? "ADMIN" : "USER",
      });
      closeLoginModal(); // 상태 통해 닫기
    } else {
      if (res.status === 403 && data.message.includes("정지")) {
        alert(data.message); // ✅ 신고 누적 안내
      } else {
        alert(data.message || "로그인 실패");
      }
    }
  };

  // const handleKakaoLogin = () => {
  //   const KAKAO_REST_API_KEY = "b62bbea46498a09baf12fedc0a9bc832";
  //   const REDIRECT_URI = "http://localhost:3000/oauth/kakao/callback";
  //   const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  //   window.location.href = kakaoURL;
  // };

  const handleKakaoLogin = () => {
    // ✅ Spring Security에서 설정한 OAuth2 엔드포인트로 이동
    window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
  };

  return (
    <div className="login-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={closeLoginModal}>
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
