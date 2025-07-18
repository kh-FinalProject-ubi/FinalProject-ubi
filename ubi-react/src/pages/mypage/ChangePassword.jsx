// src/pages/mypage/ChangePassword.jsx
import React, { useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/mypage/ChangePassword.module.css";

const ChangePassword = () => {
  const { memberNo } = useAuthStore();

  /** ------------------------- 상태 ------------------------- */
  const [form, setForm] = useState({
    currentPw: "",
    newPw: "",
    confirmPw: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showNewPw, setShowNewPw] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const hasWhitespace = (str) => /\s/.test(str);

  /** ------------------------- 유효성 ------------------------- */
  // onSubmit === true  → 최종 제출 검사
  const validateFields = (fields, onSubmit = false) => {
    const errors = {};

    /* 1) 현재 비밀번호 */
    if ("currentPw" in fields) {
     if (hasWhitespace(fields.currentPw)) {
        errors.currentPw = "공백은 사용할 수 없습니다.";
      } else if (
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=<>?]{5,}$/.test(
          fields.currentPw
        ) 
      ){
        errors.currentPw = "영문+숫자 포함 5자 이상이어야 합니다.";
      }
    }

    /* 2) 새 비밀번호 규칙 */
    if ("newPw" in fields) {
      if (hasWhitespace(fields.newPw)) {
        errors.newPw = "공백은 사용할 수 없습니다.";
      } else if (
        !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=<>?]{5,}$/.test(
          fields.newPw
        )
      ) {
        errors.newPw = "영문+숫자 포함 5자 이상이어야 합니다.";
      } else if (
        fields.currentPw !== undefined &&
        fields.newPw === fields.currentPw
      ) {
        errors.newPw = "이전 비밀번호와 동일합니다. 다른 비밀번호를 입력하세요.";
      }
    }

    /* 3) 새 비밀번호 확인 */
    if ("confirmPw" in fields) {
      // (필수) 제출 시 빈칸
      if (hasWhitespace(fields.confirmPw)) {
        errors.confirmPw = "공백은 사용할 수 없습니다.";
      } 
      else if (onSubmit && fields.confirmPw.trim() === "") {
        errors.confirmPw = "새 비밀번호 확인을 입력해주세요.";
      }
      // 입력돼 있을 때만 일치 여부 비교
      else if (
        fields.confirmPw &&
        fields.newPw &&
        fields.confirmPw !== fields.newPw
      ) {
        errors.confirmPw = "비밀번호가 일치하지 않습니다.";
      } else if (
        fields.currentPw !== undefined &&          // 현재 PW가 있고
        fields.newPw === fields.currentPw          // 값이 같으면
      ) {
        errors.newPw = "이전 비밀번호와 동일합니다. 다른 비밀번호를 입력하세요.";
      }
    }

    return errors;
  };

  /* 공백 입력 방지 */
  const blockSpace = (e) => {
    if (e.key === " ") e.preventDefault();
  };

  /** ------------------------- 핸들러 ------------------------- */
  const handleChange = (field) => (e) => {
    const updatedForm = { ...form, [field]: e.target.value };
    setForm(updatedForm);
    setValidationErrors(validateFields(updatedForm)); // 실시간(제출 아님)
    setError("");
  };

  // (1단계) 현재 비밀번호 확인
  const verifyCurrentPassword = async (e) => {
    e.preventDefault();

    const errors = validateFields({ currentPw: form.currentPw }, true);
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      const res = await axios.post("/api/myPage/selectPw", {
        memberPw: form.currentPw,
        memberNo,
      });

      if (res.data === 1) {
        setShowNewPw(true);      // 다음 단계로
        setError("");
      } else {
        setError("현재 비밀번호가 일치하지 않습니다.");
      }
    } catch {
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  // (2단계) 새 비밀번호 변경
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateFields(form, true);        // onSubmit = true
    setValidationErrors(errors);
    if (Object.keys(errors).length) return;

    try {
      const res = await axios.post("/api/myPage/changePw", {
        memberPw: form.newPw,
        memberNo,
      });

      if (res.status === 200) {
        setCompleted(true);
        setForm({ currentPw: "", newPw: "", confirmPw: "" });
      } else {
        setError(res.data.message || "비밀번호 변경 실패");
      }
    } catch {
      setError("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  /** ------------------------- 렌더 ------------------------- */
  return (
    <div className={styles.container}>
      <h2>비밀번호 변경</h2>

      <AnimatePresence mode="wait">
        {!completed ? (
          <>
            {/* ① 현재 PW 입력 폼 */}
            <form onSubmit={verifyCurrentPassword}>
              <div>
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  className={styles.input}
                  value={form.currentPw}
                  onChange={handleChange("currentPw")}
                  disabled={showNewPw}
                  onKeyDown={blockSpace}
                />
                {validationErrors.currentPw && (
                  <p className={styles.errorMessage}>
                    {validationErrors.currentPw}
                  </p>
                )}
              </div>

              {/* 버튼은 NewPw 단계에서 사라짐 */}
              <AnimatePresence>
                {!showNewPw && (
                  <motion.button
                    key="verifyBtn"
                    type="submit"
                    className={styles.button}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
                    whileTap={{ scale: 0.96 }}
                  >
                    비밀번호 확인
                  </motion.button>
                )}
              </AnimatePresence>
            </form>

            {/* ② 새 PW 입력 폼 */}
            {showNewPw && (
              <motion.form
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                onSubmit={handleSubmit}
              >
                <div>
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={form.newPw}
                    onChange={handleChange("newPw")}
                    onKeyDown={blockSpace}
                  />
                  {validationErrors.newPw && (
                    <p className={styles.errorMessage}>
                      {validationErrors.newPw}
                    </p>
                  )}
                </div>

                <div>
                  <label>새 비밀번호 확인</label>
                  <input
                    type="password"
                    className={styles.input}
                    value={form.confirmPw}
                    onChange={handleChange("confirmPw")}
                    onKeyDown={blockSpace}
                  />
                  {validationErrors.confirmPw && (
                    <p className={styles.errorMessage}>
                      {validationErrors.confirmPw}
                    </p>
                  )}
                </div>

                <button type="submit" className={styles.button}>
                  변경
                </button>
              </motion.form>
            )}

            {error && <p className={styles.errorMessage}>{error}</p>}
          </>
        ) : (
          /* 완료 화면 */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className={styles.successMessageContainer}
          >
            <h3>비밀번호가 성공적으로 변경되었습니다.</h3>
            <button
              className={styles.button}
              onClick={() => {
                setCompleted(false);
                setShowNewPw(false);
              }}
            >
              확인
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChangePassword;
