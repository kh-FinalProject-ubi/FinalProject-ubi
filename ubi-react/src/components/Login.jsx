import React, { useState } from "react";
import useAuthStore from "../stores/useAuthStore";
import { normalizeSido, normalizeSigungu } from "../utils/regionUtils";

const Login = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const extractDistrict = (fullAddress) => {
    if (!fullAddress) return "";
    const parts = fullAddress.split("^^^");
    const baseAddress = parts.length >= 2 ? parts[1] : fullAddress;
    const tokens = baseAddress.trim().split(" ");
    if (tokens.length >= 2) {
      const sido = normalizeSido(tokens[0]);
      const sigungu = normalizeSigungu(tokens[1]);
      return `${sido} ${sigungu}`; // ✅ 시도 + 시군구 반환
    }
    return baseAddress;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId || !memberPw) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ memberId, memberPw }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuth({
          token: data.token,
          address: extractDistrict(data.address),
          memberName: data.memberName,
          memberStandard: data.memberStandard,
          memberImg: data.memberImg || "",
          memberNo: data.memberNo,
        });
        console.log("✅ 일반 로그인 성공");
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (err) {
      console.error("로그인 오류:", err);
    }
  };

  // ✅ 카카오 로그인 처리
  const handleKakaoLogin = () => {
    // 실제 카카오 로그인 경로는 백엔드에서 리다이렉션 처리
    window.location.href = "/oauth2/authorization/kakao";
  };

  return (
    <form onSubmit={handleSubmit}>
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

      {/* ✅ 카카오 로그인 버튼 */}
      <button type="button" onClick={handleKakaoLogin}>
        <img
          src="/kakao-login-icon.png"
          alt="카카오 로그인"
          style={{ height: "20px", marginRight: "8px" }}
        />
        카카오로 로그인
      </button>
    </form>
  );
};

export default Login;
