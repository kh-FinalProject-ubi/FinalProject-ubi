import React, { useState, useEffect } from "react";

const FindAccount = ({ type, onBack }) => {
  const [step, setStep] = useState("select");

  const [idForm, setIdForm] = useState({
    name: "",
    email: "",
    code: "",
    sentCode: "",
    foundId: "",
  });

  const [pwForm, setPwForm] = useState({
    name: "",
    memberId: "",
    email: "",
    code: "",
    sentCode: "",
    verified: false,
    newPw: "",
    newPwCheck: "",
  });

  useEffect(() => {
    if (type === "id") setStep("id-find");
    else if (type === "pw") setStep("pw-find");
  }, [type]);

  const sendCode = async (email, target) => {
    try {
      const res = await fetch(
        `/api/sendCode?email=${encodeURIComponent(email)}&type=${target}`
      );
      const data = await res.json();

      if (res.ok) {
        alert(`${email}로 인증번호가 발송되었습니다.`);
        if (target === "id")
          setIdForm({
            ...idForm,
            sentCode: data.code,
          });
        // 서버에서 보내준 코드 저장 (보안상 보통 안보내주고 클라이언트는 인증번호 입력만 처리)
        else setPwForm({ ...pwForm, sentCode: data.code });
      } else {
        alert(data.message || "인증번호 전송 실패");
      }
    } catch (e) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  const verifyCode = async (input, target) => {
    try {
      const res = await fetch("/api/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: target === "id" ? idForm.email : pwForm.email,
          code: input,
        }),
      });
      const data = await res.json();
      return res.ok && data.verified;
    } catch {
      return false;
    }
  };

  const findId = async () => {
    try {
      const res = await fetch("/api/member/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: idForm.name, email: idForm.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setIdForm({ ...idForm, foundId: data.memberId });
      } else {
        alert(data.message || "아이디를 찾을 수 없습니다.");
      }
    } catch {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  const resetPw = async () => {
    if (pwForm.newPw !== pwForm.newPwCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      const res = await fetch("/api/member/find-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: pwForm.memberId,
          newPassword: pwForm.newPw,
        }),
      });
      if (res.ok) {
        alert("비밀번호가 성공적으로 재설정되었습니다.");
        setStep("pw-reset-success");
      } else {
        const data = await res.json();
        alert(data.message || "비밀번호 재설정 실패");
      }
    } catch {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  const handleBack = () => {
    setStep("select");
    setIdForm({
      name: "",
      email: "",
      code: "",
      sentCode: "",
      foundId: "",
    });
    setPwForm({
      name: "",
      memberId: "",
      email: "",
      code: "",
      sentCode: "",
      verified: false,
      newPw: "",
      newPwCheck: "",
    });
    onBack();
  };

  return (
    <div className="find-account-container">
      <button onClick={handleBack}>← 로그인으로 돌아가기</button>

      {/* 아이디 찾기 */}
      {step === "id-find" && (
        <div>
          <h3>아이디 찾기</h3>
          <input
            type="text"
            placeholder="이름"
            value={idForm.name}
            onChange={(e) => setIdForm({ ...idForm, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="이메일"
            value={idForm.email}
            onChange={(e) => setIdForm({ ...idForm, email: e.target.value })}
          />
          <button onClick={() => sendCode(idForm.email, "id")}>
            인증번호 전송
          </button>

          {idForm.sentCode && (
            <>
              <input
                type="text"
                placeholder="인증번호 입력"
                value={idForm.code}
                onChange={(e) => setIdForm({ ...idForm, code: e.target.value })}
              />
              <button
                onClick={() => {
                  if (verifyCode(idForm.code, idForm.sentCode)) {
                    setIdForm({ ...idForm, foundId: "sampleUser123" }); // 가상 ID
                  } else {
                    alert("인증번호가 올바르지 않습니다.");
                  }
                }}
              >
                인증 확인
              </button>
            </>
          )}

          {idForm.foundId && (
            <div className="result-box">
              <p>
                회원님의 아이디는 <strong>{idForm.foundId}</strong> 입니다.
              </p>
              <button onClick={() => setStep("pw-find")}>비밀번호 찾기</button>
            </div>
          )}
        </div>
      )}

      {/* 비밀번호 찾기 */}
      {step === "pw-find" && (
        <div>
          <h3>비밀번호 찾기</h3>
          <input
            type="text"
            placeholder="이름"
            value={pwForm.name}
            onChange={(e) => setPwForm({ ...pwForm, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="아이디"
            value={pwForm.memberId}
            onChange={(e) => setPwForm({ ...pwForm, memberId: e.target.value })}
          />
          <input
            type="email"
            placeholder="이메일"
            value={pwForm.email}
            onChange={(e) => setPwForm({ ...pwForm, email: e.target.value })}
          />
          <button onClick={() => sendCode(pwForm.email, "pw")}>
            인증번호 전송
          </button>

          {pwForm.sentCode && !pwForm.verified && (
            <>
              <input
                type="text"
                placeholder="인증번호 입력"
                value={pwForm.code}
                onChange={(e) => setPwForm({ ...pwForm, code: e.target.value })}
              />
              <button
                onClick={() => {
                  if (verifyCode(pwForm.code, pwForm.sentCode)) {
                    setPwForm({ ...pwForm, verified: true });
                  } else {
                    alert("인증번호가 올바르지 않습니다.");
                  }
                }}
              >
                인증 확인
              </button>
            </>
          )}

          {pwForm.verified && (
            <>
              <input
                type="password"
                placeholder="새 비밀번호"
                value={pwForm.newPw}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPw: e.target.value })
                }
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={pwForm.newPwCheck}
                onChange={(e) =>
                  setPwForm({ ...pwForm, newPwCheck: e.target.value })
                }
              />
              <button onClick={resetPw}>비밀번호 재설정</button>
            </>
          )}
        </div>
      )}

      {/* 비밀번호 재설정 완료 */}
      {step === "pw-reset-success" && (
        <div>
          <h3>비밀번호 재설정이 완료되었습니다!</h3>
          <button onClick={handleBack}>로그인 하러가기</button>
        </div>
      )}
    </div>
  );
};

export default FindAccount;
