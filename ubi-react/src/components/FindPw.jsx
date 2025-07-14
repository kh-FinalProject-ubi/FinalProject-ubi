import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FindPw = () => {
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [newPwCheck, setNewPwCheck] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const navigate = useNavigate();

  const sendCode = async () => {
    if (!name || !memberId || !email) return alert("이름, 아이디, 이메일을 모두 입력해주세요.");
  
    setLoading(true); // 버튼 눌렀을 때 바로 표시
    try {
      const res = await fetch(`/api/member/sendCode?email=${encodeURIComponent(email)}&type=pw`);
      const data = await res.json();
      setSentCode(data.code);
      alert("인증번호가 발송되었습니다.");
    } catch (e) {
      alert("인증번호 전송 실패");
    } finally {
      setLoading(false); // 요청 끝나면 복원
    }
  };

  const verifyCode = async () => {
    const res = await fetch("/api/member/verifyCode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (data.verified) {
      setVerified(true);
      alert("인증 성공");
    } else {
      alert("인증번호가 올바르지 않습니다.");
    }
  };

  const resetPassword = async () => {
    if (newPw !== newPwCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("/api/member/reset-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId,
          email,
          newPassword: newPw,
        }),
      });

      if (res.ok) {
        alert("비밀번호가 성공적으로 재설정되었습니다.");
        setSuccess(true);
      } else {
        const data = await res.json();
        alert(data.message || "비밀번호 재설정 실패");
      }
    } catch {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  if (success) {
    return (
      <div className="find-account-container">
        <h3>비밀번호 재설정이 완료되었습니다!</h3>
        <button onClick={() => navigate("/login")}>로그인 하러가기</button>
      </div>
    );
  }

  return (
    <div className="find-account-container">
      <h2>비밀번호 찾기</h2>
      <input placeholder="이름" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="아이디" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
      <input placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button onClick={sendCode} disabled={loading}>
  {loading ? "전송 중..." : "인증번호 전송"}
</button>

      {sentCode && !verified && (
        <>
          <input placeholder="인증번호 입력" value={code} onChange={(e) => setCode(e.target.value)} />
          <button onClick={verifyCode}>인증 확인</button>
        </>
      )}

      {verified && (
        <>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={newPwCheck}
            onChange={(e) => setNewPwCheck(e.target.value)}
          />
          <button onClick={resetPassword}>비밀번호 재설정</button>
        </>
      )}
    </div>
  );
};

export default FindPw;
