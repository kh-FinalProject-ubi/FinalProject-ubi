import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/mypage/Withdraw.module.css";

const Withdraw = () => {
  const { memberNo, clearAuth } = useAuthStore();
  const { token } = useAuthStore(); // Zustand에서 회원 정보 가져옴

  const [form, setForm] = useState({
    currentPw: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);

  const [step, setStep] = useState(1);
  const [agree, setAgree] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false); // 👈 아코디언 상태

  // 통합 유효성 검사
  const validateFields = (fields) => {
    const errors = {};

    if (
      fields.currentPw !== undefined &&
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=<>?]{5,}$/.test(
        fields.currentPw
      )
    ) {
      errors.currentPw = "영문+숫자 포함 5자 이상이어야 합니다.";
    }

    return errors;
  };

  // 실시간 입력 핸들러
  const handleChange = (field) => (e) => {
    const updatedForm = { ...form, [field]: e.target.value };
    setForm(updatedForm);

    const errors = validateFields(updatedForm);
    setValidationErrors(errors);

    if (
      updatedForm.currentPw && // 값이 있고
      !errors.currentPw // 오류가 없으면
    ) {
      setSuccess("사용 가능한 비밀번호입니다.");
    } else {
      setSuccess("");
    }

    setError("");
  };

  // 현재 비밀번호 확인
  const verifyPassword = async (e) => {
    e.preventDefault(); // 폼 기본 동작 차단!!
    setError("");
    setSuccess("");
    console.log("✅ verifyPassword 실행됨!");

    if (!form.currentPw) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    console.log("🚀 axios.post 호출 준비");

    const errors = validateFields({ currentPw: form.currentPw });
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      console.log("현재 비밀번호 전송!");
      const res = await axios.post("/api/myPage/selectPw", {
        memberPw: form.currentPw,
        memberNo: memberNo,
      });

      if (res.data === 1) {
        console.log("응답받음");
        setError("");
        setStep(2);
      } else {
        setError("현재 비밀번호가 일치하지 않습니다.");
      }
    } catch {
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  // const handleNextStep2 = (e) => {
  //   e.preventDefault();
  // };

  const withdraw = async (e) => {
    e.preventDefault(); // 폼 기본 동작 차단!!
    if (!agree) {
      alert("약관에 동의해야 다음 단계로 진행할 수 있습니다.");
      return;
    }

    const confirmed = window.confirm("정말 탈퇴하시겠습니까?");
    if (!confirmed) {
      return; // 취소 누르면 함수 종료
    }

    setError("");
    setSuccess("");

    try {
      const res = await axios.post("/api/myPage/withdraw", {
        memberNo: memberNo,
      });

      if (res.data === 1) {
        console.log("응답받음");
        setError("");
        setStep(3);
      }
    } catch {
      setError("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  const handleGoHome = () => {
    useAuthStore.getState().clearAuth();
    window.location.href = "/";
  };

  useEffect(() => {
    if (step === 3) {
      useAuthStore.getState().clearAuth();
      localStorage.removeItem("kakaoId");

      setCountdown(5);
      setProgress(0);

      const duration = 5000;
      const interval = 50;
      const totalTicks = duration / interval;
      let tick = 0;

      const timer = setInterval(() => {
        tick++;

        // 1초마다 countdown -1
        if (tick % (1000 / interval) === 0) {
          setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }

        // progress 부드럽게 증가
        setProgress(Math.min((tick / totalTicks) * 100, 100));

        if (tick >= totalTicks) {
          clearInterval(timer);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [step]);

  useEffect(() => {
    if (progress >= 100 && step === 3) {
      const timeout = setTimeout(() => {
        window.location.href = "/";
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [progress, step]);

  return (
    <div className={styles.withdrawContainer}>
      <h2>회원 탈퇴</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={verifyPassword}>
          <p>탈퇴를 위해 비밀번호를 입력해주세요.</p>
          <input
            type="password"
            name="currentPw"
            value={form.currentPw}
            placeholder="비밀번호를 입력해주세요."
            onChange={handleChange("currentPw")}
          />
          {validationErrors.currentPw && (
            <p className={styles.error}>{validationErrors.currentPw}</p>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit">다음</button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form>
          <div className={styles.termsBox}>
            <h3>회원 탈퇴 전 반드시 아래 내용을 확인해 주세요.</h3>
            <ul>
              <li>
                회원 정보 및 개인화된 서비스 이용 기록은
                <strong> 개인정보 처리방침</strong>에 따라 삭제되며,
                <strong> 복구가 불가능</strong>합니다.
              </li>
              <li>
                탈퇴 신청 즉시 계정은 <strong>비활성화</strong>되며,
                <strong> 30일 후 자동 영구 삭제</strong>됩니다.
              </li>
              <li>
                탈퇴 후 <strong>최대 7일간 동일한 정보로 재가입이 제한</strong>
                됩니다.
              </li>
            </ul>

            <button
              type="button"
              className={styles.accordionToggle}
              onClick={() => setShowFullTerms((prev) => !prev)}
            >
              {showFullTerms ? "약관 전문 닫기 ▲" : "약관 전문 보기 ▼"}
            </button>

            <AnimatePresence>
              {showFullTerms && (
                <motion.div
                  key="terms"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className={styles.fullTerms}>
                    <h4>회원 탈퇴 안내 및 동의 약관</h4>
                    <p>본 약관은 회원이 자발적으로 탈퇴를 신청할 경우, ...</p>
                    {/* 이하 생략 */}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <label className={styles.agreementCheck}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              위 약관을 모두 읽고 동의합니다.
            </label>
          </div>
          <button type="submit" onClick={withdraw}>
            탈퇴하기
          </button>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className={styles.completeStep}>
          <p>
            <strong>회원 탈퇴가 완료되었습니다.</strong>
          </p>
          <p>{countdown}초 후 홈으로 이동합니다.</p>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            />
          </div>
          <button onClick={handleGoHome}>홈으로</button>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
