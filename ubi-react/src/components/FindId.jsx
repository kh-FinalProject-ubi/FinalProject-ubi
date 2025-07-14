import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FindId = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [foundId, setFoundId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const sendCode = async () => {
    setMessage("");
    setError("");

    if (!email || !name) {
      setError("이름과 이메일을 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/member/sendCode?email=${encodeURIComponent(email)}&type=id`);
      const data = await res.json();

      if (res.ok) {
        setSentCode(data.code);
        setMessage("인증번호가 발송되었습니다.");
      } else {
        setError("인증번호 전송 실패");
      }
    } catch (e) {
      setError("인증번호 전송 실패");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndFindId = async () => {
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/member/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!data.verified) {
        setError("인증번호가 올바르지 않습니다.");
        return;
      }

      const res2 = await fetch("/api/member/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const result = await res2.json();

      if (res2.ok) {
        const idRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (idRegex.test(result.memberId)) {
          setFoundId(result.memberId);
          setMessage("");
        } else {
          setError("찾은 아이디가 올바르지 않은 형식입니다.");
        }
      } else {
        setError(result.message || "아이디 찾기 실패");
      }
    } catch (e) {
      setError("아이디 찾기 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="find-account-container">
      <h2>아이디 찾기</h2>

      <input
        placeholder="이름"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={sendCode} disabled={loading}>
        {loading ? "전송 중..." : "인증번호 전송"}
      </button>
      {message && <span style={{ color: "green" }}>{message}</span>}

      {sentCode && (
        <>
          <input
            placeholder="인증번호 입력"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button onClick={verifyAndFindId}>인증 확인</button>
        </>
      )}

      {foundId && (
        <div>
          <p>
            회원님의 아이디는 <strong>{foundId}</strong> 입니다.
          </p>
          <button onClick={() => navigate("/login/find-pw")}>
            비밀번호 찾기
          </button>
        </div>
      )}

      {/* 메시지 출력 영역 */}
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
};

export default FindId;
