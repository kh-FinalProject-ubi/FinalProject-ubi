import React, { useState } from "react";
import useAuthStore from "../stores/useAuthStore";

const Login = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

  const extractDistrict = (fullAddress) => {
    if (!fullAddress) return "";

    // 우편번호^^^기본주소^^^상세주소 중 기본주소만 추출
    const parts = fullAddress.split("^^^");
    const baseAddress = parts.length >= 2 ? parts[1] : fullAddress;

    const tokens = baseAddress.trim().split(" ");
    if (tokens.length === 1) return normalizeSido(tokens[0]);
    if (tokens.length >= 2) {
      const sido = normalizeSido(tokens[0]);
      const sigungu = normalizeSigungu(tokens[1]);
      return `${sido} ${sigungu}`;
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
        console.log("🔍 서버 응답 주소:", data.address); // 여기에 추가

        setAuth({
          token: data.token,
          address: extractDistrict(data.address), // ✅ 시군구 단위로 자른 주소
          memberName: data.memberName,
           memberStandard: data.memberStandard, // ✅ 저장
          memberImg: data.memberImg || "",
        });
              console.log("✅ 로그인 성공");
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (err) {
      console.error("로그인 오류:", err);
    }
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
    </form>
  );
};

export default Login;
