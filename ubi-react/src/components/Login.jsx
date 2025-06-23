import React, { useState } from "react";
import useAuthStore from "../stores/useAuthStore";

const Login = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const setAuth = useAuthStore((state) => state.setAuth);

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
          address: data.address,
          memberName: data.memberName,
           memberStandard: data.memberStandard, // ✅ 저장
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
