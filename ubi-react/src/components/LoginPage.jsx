import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import { useSearchParams } from "react-router-dom";
import styles from "../styles/common/LoginPage.module.css";

// 이메일 유효성 검사 헬퍼 함수
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// 시간 포맷팅 헬퍼 함수 (MM:SS)
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

const handleKakaoLogin = () => {
  window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
};

const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const mode = searchParams.get("mode") || "login";
  const [resetInfo, setResetInfo] = useState({ memberId: "", email: "" });

  // 모드 변경 함수
  const goToMode = (targetMode) => {
    setSearchParams({ mode: targetMode });
  };

  return (
    <div className={styles.loginPageContainer}>
      <main className={styles.loginMainContent}>
        <div className={styles.imageBox}>
          {mode === "login" && (
            <img src="/images/login-bear-surprised.png" alt="login" />
          )}
          {mode !== "login" && (
            <img src="/images/default-thumbnail.png" alt="login" />
          )}
        </div>

        <div className={styles.formContainer}>
          {mode === "login" && <LoginForm setMode={goToMode} />}
          {mode === "find-id" && <FindIdForm setMode={goToMode} />}
          {mode === "find-pw" && (
            <FindPwForm setMode={goToMode} setResetInfo={setResetInfo} />
          )}
          {mode === "reset-pw" && (
            <ResetPwForm
              setMode={goToMode}
              memberId={resetInfo.memberId}
              email={resetInfo.email}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

// ========================
// 로그인 폼
// ========================
const LoginForm = ({ setMode }) => {
  const [memberId, setMemberId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!memberId || !password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, memberPw: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data); // Zustand 스토어 업데이트
        navigate("/");
      } else {
        alert(data.message || "로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("로그인 오류", err);
      alert("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.formContent}>
        <h3 className={styles.formTitle}>Login</h3>
        <form onSubmit={handleLogin}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="아이디"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
            />
          </div>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className={styles.confirmBtn}
            disabled={isLoading}
          >
            {isLoading ? "로딩중..." : "로그인"}
          </button>
        </form>
        <button onClick={handleKakaoLogin} className={styles.kakaoBtn}>
          카카오로 로그인하기
        </button>
      </div>
      <div className={styles.findAccountLink}>
        <button onClick={() => setMode("find-id")}>아이디 찾기</button>
        <span>|</span>
        <button onClick={() => setMode("find-pw")}>비밀번호 찾기</button>
      </div>
    </>
  );
};

// ========================
// 아이디 찾기 폼
// ========================
const FindIdForm = ({ setMode }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [foundId, setFoundId] = useState("");
  const [timer, setTimer] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email === "") {
      setErrors((prev) => ({ ...prev, email: "" }));
      return;
    }
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(email)
        ? "사용 가능한 이메일 형식입니다."
        : "이메일 형식이 올바르지 않습니다.",
    }));
  }, [email]);

  useEffect(() => {
    if (!isTimerActive) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const handleSendCode = async () => {
    let newErrors = {};
    if (!name) newErrors.name = "이름을 입력해주세요.";
    if (!email) newErrors.email = "이메일을 입력해주세요.";
    else if (!validateEmail(email))
      newErrors.email = "이메일 형식이 올바르지 않습니다.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/member/sendCode?email=${encodeURIComponent(email)}&type=id`
      );
      if (res.ok) {
        setIsCodeSent(true);
        setTimer(300);
        setIsTimerActive(true);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "인증번호 전송에 실패했습니다.");
      }
    } catch (err) {
      console.error("인증번호 전송 오류", err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlineVerify = async () => {
    if (timer === 0) {
      setErrors({ code: "인증 시간이 만료되었습니다. 다시 요청해주세요." });
      return;
    }
    if (!code) {
      setErrors({ code: "인증번호를 입력해주세요." });
      return;
    }
    try {
      const verifyRes = await fetch("/api/member/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        setIsCodeVerified(true);
        setSuccessMsg("인증확인되었습니다.");
        setErrors({});
        setIsTimerActive(false);
      } else {
        setIsCodeVerified(false);
        setErrors({ code: "인증번호가 맞지 않습니다." });
        setSuccessMsg("");
      }
    } catch (err) {
      console.error("인증 오류", err);
      alert("인증 중 오류가 발생했습니다.");
    }
  };

  const handleFinalFindId = async () => {
    try {
      const findIdRes = await fetch("/api/member/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const resultData = await findIdRes.json();
      if (findIdRes.ok) {
        setFoundId(resultData.memberId);
      } else {
        alert(resultData.message || "아이디를 찾는 데 실패했습니다.");
      }
    } catch (err) {
      console.error("아이디 찾기 오류", err);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className={styles.formContent}>
        <h3 className={styles.formTitle}>ID 찾기</h3>
        <div className={styles.inputWrapper}>
          <input
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCodeSent}
          />
          {errors.name && (
            <span className={styles.errorMessage}>{errors.name}</span>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.inputGroup}>
            <input
              placeholder="가입한 이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCodeSent}
            />
            {!isCodeSent && (
              <button
                onClick={handleSendCode}
                className={styles.authBtn}
                disabled={isLoading}
              >
                {isLoading ? "로딩중..." : "인증요청"}
              </button>
            )}
          </div>
          {errors.email && (
            <span
              className={
                validateEmail(email)
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {errors.email}
            </span>
          )}
        </div>
        {isCodeSent && !foundId && (
          <>
            <div className={styles.inputWrapper}>
              <div className={styles.inputGroup}>
                <input
                  placeholder="인증번호 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isCodeVerified}
                />
                {isTimerActive && (
                  <span className={styles.timer}>{formatTime(timer)}</span>
                )}
                {!isCodeVerified && (
                  <button
                    onClick={handleInlineVerify}
                    className={styles.authBtn}
                  >
                    인증확인
                  </button>
                )}
              </div>
              {errors.code && (
                <span className={styles.errorMessage}>{errors.code}</span>
              )}
              {successMsg && (
                <span className={styles.successMessage}>{successMsg}</span>
              )}
            </div>
            <button
              onClick={handleFinalFindId}
              className={styles.confirmBtn}
              disabled={!isCodeVerified}
            >
              아이디 찾기
            </button>
          </>
        )}
        {foundId && (
          <div className={styles.resultBox}>
            <p>회원님의 아이디입니다.</p>
            <strong>{foundId}</strong>
          </div>
        )}
      </div>
      <div className={styles.findAccountLink}>
        <button onClick={() => setMode("login")}>로그인 하러가기</button>
      </div>
    </>
  );
};

// ========================
// 비밀번호 찾기 폼
// ========================
const FindPwForm = ({ setMode, setResetInfo }) => {
  const [name, setName] = useState("");
  const [memberId, setMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [timer, setTimer] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (email === "") {
      setErrors((prev) => ({ ...prev, email: "" }));
      return;
    }
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(email)
        ? "사용 가능한 이메일 형식입니다."
        : "이메일 형식이 올바르지 않습니다.",
    }));
  }, [email]);

  useEffect(() => {
    if (!isTimerActive) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerActive]);

  const handleSendCode = async () => {
    let newErrors = {};
    if (!name) newErrors.name = "이름을 입력해주세요.";
    if (!memberId) newErrors.memberId = "아이디를 입력해주세요.";
    if (!email) newErrors.email = "이메일을 입력해주세요.";
    else if (!validateEmail(email))
      newErrors.email = "이메일 형식이 올바르지 않습니다.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/member/sendCode?email=${encodeURIComponent(email)}&type=pw`
      );
      if (res.ok) {
        setIsCodeSent(true);
        setTimer(300);
        setIsTimerActive(true);
      } else {
        const errorData = await res.json();
        alert(
          errorData.message ||
            "인증번호 전송에 실패했습니다. 입력 정보를 확인해주세요."
        );
      }
    } catch (err) {
      console.error("인증번호 전송 오류", err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInlineVerify = async () => {
    if (timer === 0) {
      setErrors({ code: "인증 시간이 만료되었습니다. 다시 요청해주세요." });
      return;
    }
    if (!code) {
      setErrors({ code: "인증번호를 입력해주세요." });
      return;
    }
    try {
      const verifyRes = await fetch("/api/member/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        setIsCodeVerified(true);
        setSuccessMsg("인증확인되었습니다.");
        setErrors({});
        setIsTimerActive(false);
      } else {
        setIsCodeVerified(false);
        setErrors({ code: "인증번호가 맞지 않습니다." });
        setSuccessMsg("");
      }
    } catch (err) {
      console.error("인증 오류", err);
      alert("인증 중 오류가 발생했습니다.");
    }
  };

  const handleFinalVerify = () => {
    setResetInfo({ memberId, email });
    setMode("reset-pw");
  };

  return (
    <>
      <div className={styles.formContent}>
        <h3 className={styles.formTitle}>비밀번호 찾기</h3>
        <div className={styles.inputWrapper}>
          <input
            placeholder="이름 입력"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCodeSent}
          />
          {errors.name && (
            <span className={styles.errorMessage}>{errors.name}</span>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <input
            placeholder="아이디 입력"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            disabled={isCodeSent}
          />
          {errors.memberId && (
            <span className={styles.errorMessage}>{errors.memberId}</span>
          )}
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.inputGroup}>
            <input
              placeholder="가입한 이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCodeSent}
            />
            {!isCodeSent && (
              <button
                onClick={handleSendCode}
                className={styles.authBtn}
                disabled={isLoading}
              >
                {isLoading ? "로딩중..." : "인증요청"}
              </button>
            )}
          </div>
          {errors.email && (
            <span
              className={
                validateEmail(email)
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {errors.email}
            </span>
          )}
        </div>
        {isCodeSent && (
          <>
            <div className={styles.inputWrapper}>
              <div className={styles.inputGroup}>
                <input
                  placeholder="인증번호 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isCodeVerified}
                />
                {isTimerActive && (
                  <span className={styles.timer}>{formatTime(timer)}</span>
                )}
                {!isCodeVerified && (
                  <button
                    onClick={handleInlineVerify}
                    className={styles.authBtn}
                  >
                    인증확인
                  </button>
                )}
              </div>
              {errors.code && (
                <span className={styles.errorMessage}>{errors.code}</span>
              )}
              {successMsg && (
                <span className={styles.successMessage}>{successMsg}</span>
              )}
            </div>
            <button
              onClick={handleFinalVerify}
              className={styles.confirmBtn}
              disabled={!isCodeVerified}
            >
              비밀번호 재설정하기
            </button>
          </>
        )}
      </div>
      <div className={styles.findAccountLink}>
        <button onClick={() => setMode("login")}>로그인 하러가기</button>
      </div>
    </>
  );
};

// ========================
// 비밀번호 재설정 폼
// ========================
const ResetPwForm = ({ setMode, memberId, email }) => {
  const [newPw, setNewPw] = useState("");
  const [newPwCheck, setNewPwCheck] = useState("");
  const [error, setError] = useState("");
  const [subMode, setSubMode] = useState("input");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (newPw && newPwCheck && newPw !== newPwCheck) {
      setError("비밀번호가 일치하지 않습니다.");
    } else {
      setError("");
    }
  }, [newPw, newPwCheck]);

  const handleReset = async () => {
    if (newPw !== newPwCheck || !newPw) {
      setError(
        newPw ? "비밀번호가 일치하지 않습니다." : "새 비밀번호를 입력해주세요."
      );
      return;
    }
    setError("");
    setIsLoading(true);
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
        setSubMode("complete");
      } else {
        alert("비밀번호 재설정 중 오류가 발생했습니다.");
      }
    } catch {
      alert("오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (subMode === "complete") {
    return (
      <div className={styles.resetCompleteBox}>
        <img
          src="/images/login-complete-bear.png"
          alt="완료"
          className={styles.completeImage}
        />
        <h3 className={styles.formTitle}>비밀번호 변경 완료!</h3>
        <p>
          로그인 페이지로 이동하여
          <br />
          새로운 비밀번호로 로그인해주세요.
        </p>
        <button onClick={() => setMode("login")} className={styles.confirmBtn}>
          로그인 하러가기
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={styles.formContent}>
        <h3 className={styles.formTitle}>비밀번호 재설정</h3>
        <div className={styles.inputWrapper}>
          <input
            type="password"
            placeholder="새 비밀번호 입력"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
          />
        </div>
        <div className={styles.inputWrapper}>
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={newPwCheck}
            onChange={(e) => setNewPwCheck(e.target.value)}
          />
          {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
        <button
          onClick={handleReset}
          className={styles.confirmBtn}
          disabled={isLoading}
        >
          {isLoading ? "로딩중..." : "확인"}
        </button>
      </div>
      <div className={styles.findAccountLink}>
        <button onClick={() => setMode("login")}>로그인 하러가기</button>
      </div>
    </>
  );
};
