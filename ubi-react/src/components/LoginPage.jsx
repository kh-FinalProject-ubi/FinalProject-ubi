import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useModalStore from "../stores/useModalStore";
import styles from "../styles/common/LoginPage.module.css";
import SuspensionNotice from "./common/SuspensionNotice.JSX";

// 이메일 유효성 검사
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 시간 포맷팅
const formatTime = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
};

const handleKakaoLogin = () => {
  window.location.href = "http://localhost:8080/oauth2/authorization/kakao";
};

const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [resetInfo, setResetInfo] = useState({ memberId: "", email: "" });

  const { suspensionNotice, setSuspensionNotice } = useAuthStore();
  const { alertMessage, setAlertMessage, clearAlertMessage } = useModalStore(); // ✅ 추가

  const [showNotice, setShowNotice] = useState(false);

  const goToMode = (targetMode) => setSearchParams({ mode: targetMode });


  useEffect(() => {
    if (alertMessage) {
      setShowNotice(true);
    }
  }, [alertMessage]);

  return (
    <div className={styles.loginPageContainer}>
      {showNotice && (
        <SuspensionNotice
          message={suspensionNotice || alertMessage}
          onClose={() => {
            setSuspensionNotice(null);
            clearAlertMessage(); // ✅ alertMessage도 초기화
            setShowNotice(false);
          }}
        />
      )}

      <main className={styles.loginMainContent}>
        <div className={styles.imageBox}>
          <img src="/default-thumbnail.png" alt="login" />
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
  const [saveId, setSaveId] = useState(false);
  const { setAuth, setSuspensionNotice } = useAuthStore();
  const navigate = useNavigate();

  // 이미 기존의 아이디 저장된 거 찾아오기
  useEffect(() => {
    const savedMemberId = localStorage.getItem("savedMemberId");
    if (savedMemberId) {
      setMemberId(savedMemberId);
      setSaveId(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!memberId || !password) {
      alert("아이디와 비밀번호를 입력해주세요.");
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
        if (saveId) localStorage.setItem("savedMemberId", memberId);
        else localStorage.removeItem("savedMemberId");

        setAuth(data);
        navigate("/");
      } else {
        if (data.suspensionMessage) {
          setSuspensionNotice(data.suspensionMessage); // 정지 메시지 모달로 띄우기
        } else {
          alert(data.message || "로그인 실패");
        }
        setPassword("");
      }
    } catch {
      alert("오류 발생");
      setMemberId("");
      setPassword("");
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
          <div className={styles.inputMessageWrapper}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {/* 아이디 저장 체크박스 추가 */}
          <div className={styles.saveIdWrapper}>
            <div>
              <input
                type="checkbox"
                id="save-id"
                checked={saveId}
                onChange={(e) => setSaveId(e.target.checked)}
              />
              <label htmlFor="save-id">아이디 저장</label>
            </div>

            <div className={styles.findAccountLink}>
              <button type="button" onClick={() => setMode("find-id")}>
                ID{"  "}
              </button>
              <span>|</span>
              <button type="button" onClick={() => setMode("find-pw")}>
                PW찾기{"  "}
              </button>
            </div>
          </div>

          <div className={styles.bulletWrapper}>
            <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
            <span className={`${styles.bullet} ${styles.bullet2}`}>•</span>
            <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
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
      <Link to="/signup" className={styles.signupLink}>
        회원가입
      </Link>
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
      // 이메일이 비었을 때는 메시지를 완전히 제거합니다.
      setErrors((prev) => ({ ...prev, email: null }));
      return;
    }

    const isValid = validateEmail(email);
    setErrors((prev) => ({
      ...prev,
      email: {
        text: isValid
          ? "사용 가능한 이메일 형식입니다."
          : "이메일 형식이 올바르지 않습니다.",
        type: isValid ? "success" : "error", // 'success' 또는 'error' 타입을 추가합니다.
      },
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
    else if (!validateEmail(email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      setEmail(""); // 이메일 입력칸 비우기
      return;
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    setIsLoading(true);
  
    try {
      const res = await fetch(`/api/member/sendCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "id",
          name,
          email,
        }),
      });
  
      if (res.ok) {
        setIsCodeSent(true);
        setTimer(300);
        setIsTimerActive(true);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "인증번호 전송에 실패했습니다.");
        setName("");
        setEmail("");
      }
    } catch (err) {
      console.error("인증번호 전송 오류", err);
      alert("오류가 발생했습니다.");
      setName("");
      setEmail("");
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
        setCode("");
      }
    } catch (err) {
      console.error("인증 오류", err);
      alert("인증 중 오류가 발생했습니다.");
      setCode("");
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
        setName("");
        setEmail("");
        setCode("");
        setIsCodeSent(false);
        setIsCodeVerified(false);
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
        <div className={`${styles.inputWrapper} ${styles.inputWrapperID}`}>
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

        <div className={styles.inputMessageWrapper}>
          <div className={styles.inputGroup}>
            <input
              placeholder="가입한 이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCodeSent}
            />
            <button
              onClick={handleSendCode}
              className={styles.authBtn}
              disabled={isLoading || isCodeSent}
            >
              {isLoading ? "로딩중..." : "인증요청"}
            </button>
          </div>
          {errors.email?.text && (
            <span
              className={
                errors.email.type === "success"
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {errors.email.text}
            </span>
          )}
        </div>
        {isCodeSent && !foundId && (
          <>
            <div className={styles.inputMessageWrapper}>
              <div className={styles.inputGroup}>
                <input
                  placeholder="인증번호 입력"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={isCodeVerified}
                  style={{ width: "310px", marginTop: "10px" }}
                />
                {!isCodeVerified && (
                  <button
                    onClick={handleInlineVerify}
                    className={styles.authBtn}
                  >
                    인증확인
                  </button>
                )}
              </div>

              {/* 3. 메시지들을 inputGroup과 같은 레벨로 이동 */}
              {errors.code && (
                <span className={`${styles.message} ${styles.errorMessage}`}>
                  {errors.code}
                </span>
              )}
              {successMsg && (
                <span className={`${styles.message} ${styles.successMessage}`}>
                  {successMsg}
                </span>
              )}
              {isTimerActive && (
                <span className={`${styles.message} ${styles.timer}`}>
                  {formatTime(timer)}
                </span>
              )}
            </div>

            <button
              onClick={handleFinalFindId}
              className={styles.confirmBtn}
              disabled={!isCodeVerified}
              style={{ marginTop: "30px" }}
            >
              확인
            </button>
          </>
        )}

        {foundId && (
          <div className={styles.resultBox}>
            <p>회원님의 아이디입니다.</p>
            <strong>{foundId}</strong>
          </div>
        )}

        <div className={styles.bulletWrapper}>
          <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
          <span className={`${styles.bullet} ${styles.bullet2}`}>•</span>
          <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
        </div>
        <div className={styles.inputWrapper}>
          <button onClick={() => setMode("login")} className={styles.kakaoBtn}>
            로그인 하러가기
          </button>
          <div className={styles.findAccountLink}>
            <button
              onClick={() => setMode("find-pw")}
              className={styles.signupLink}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
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
    else if (!validateEmail(email)) {
      alert("이메일 형식이 올바르지 않습니다.");
      setEmail(""); // 이메일 입력칸 비우기
      return;
    }
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    setErrors({});
    setIsLoading(true);
  
    try {
      const res = await fetch("/api/member/sendCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          memberId,
          email,
          type: "pw",
        }),
      });
  
      if (res.ok) {
        setIsCodeSent(true);
        setTimer(300);
        setIsTimerActive(true);
      } else {
        const errorData = await res.json();
        alert(errorData.message || "인증번호 전송에 실패했습니다.");
        setName("");
        setMemberId("");
        setEmail("");
      }
    } catch (err) {
      console.error("인증번호 전송 오류", err);
      alert("오류가 발생했습니다.");
      setName("");
      setMemberId("");
      setEmail("");
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
        setCode("");
      }
    } catch (err) {
      console.error("인증 오류", err);
      alert("인증 중 오류가 발생했습니다.");
      setCode("");
    }
  };

  const handleFinalVerify = () => {
    setResetInfo({ memberId, email });
    setMode("reset-pw");
  };

  useEffect(() => {
    if (suspensionNotice) {
      setShowNotice(true);
    }
  }, [suspensionNotice]);

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
        <div className={styles.inputMessageWrapper}>
          <div className={styles.inputGroup}>
            <input
              placeholder="가입한 이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isCodeSent}
            />
            <div className={styles.emailSpacer}></div>
            <button
              onClick={handleSendCode}
              className={styles.authBtn}
              disabled={isLoading || isCodeSent}
            >
              {isLoading ? "로딩중..." : "인증요청"}
            </button>
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
  <div className={styles.inputGroup} style={{ marginTop: "10px" }}>
    <input
      placeholder="인증번호 입력"
      value={code}
      onChange={(e) => setCode(e.target.value)}
      disabled={isCodeVerified}
      className={
        isCodeVerified ? styles.authInputFull : styles.authInput
      }
    />
    {!isCodeVerified && (
      <>
        <button onClick={handleInlineVerify} className={styles.authBtn}>
          인증확인
        </button>
      </>
    )}
  </div>

    {isTimerActive && (
      <span className={styles.timer}>{formatTime(timer)}</span>
    )}
  <div className={styles.messageWrapper}>
    {errors.code && (
      <span className={styles.errorMessage}>{errors.code}</span>
    )}
    {successMsg && (
      <span className={styles.successMessage}>{successMsg}</span>
    )}
  </div>
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
        <div className={styles.bulletWrapper}>
          <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
          <span className={`${styles.bullet} ${styles.bullet2}`}>•</span>
          <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
        </div>
        <div className={styles.inputWrapper}>
          <button onClick={() => setMode("login")} className={styles.kakaoBtn}>
            로그인 하러가기
          </button>
          <div className={styles.findAccountLink}>
            <button
              onClick={() => setMode("find-id")}
              className={styles.signupLink}
            >
              아이디 찾기
            </button>
          </div>
        </div>
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
      setNewPw("");
      setNewPwCheck("");
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
        alert("비밀번호를 변경할 수 없습니다. 입력 정보를 확인해 주세요.");
      }
      setNewPw("");
      setNewPwCheck("");
    } catch {
      alert("오류가 발생했습니다.");
      setNewPw("");
      setNewPwCheck("");
    } finally {
      setIsLoading(false);
    }
  };

  if (subMode === "complete") {
    return (
      <div className={styles.resetCompleteBox}>
        <h3 className={styles.formTitle}>비밀번호 변경 완료!</h3>
        <p>
          비밀번호 재샐정을 완료했습니다 !
          <br />
          새로운 비밀번호로 로그인해주세요.
        </p>
        <div className={styles.inputWrapper}>
          <button onClick={() => setMode("login")} className={styles.kakaoBtn}>
            로그인 하러가기
          </button>
        </div>
        <img src="/ubi.svg" alt="완료" className={styles.completeImage} />
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
      <div className={styles.bulletWrapper}>
        <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
        <span className={`${styles.bullet} ${styles.bullet2}`}>•</span>
        <span className={`${styles.bullet} ${styles.bullet1}`}>•</span>
      </div>
      <div className={styles.inputWrapper}>
        <button onClick={() => setMode("login")} className={styles.kakaoBtn}>
          로그인 하러가기
        </button>
      </div>
    </>
  );
};
