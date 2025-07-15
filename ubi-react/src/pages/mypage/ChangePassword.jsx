import React, { useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/mypage/ChangePassword.module.css";

const ChangePassword = () => {
  const { memberNo } = useAuthStore();

  const [form, setForm] = useState({
    currentPw: "",
    newPw: "",
    confirmPw: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showNewPw, setShowNewPw] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const validateFields = (fields) => {
    const errors = {};

    if (fields.currentPw !== undefined && fields.currentPw.length < 5) {
      errors.currentPw = "현재 비밀번호는 5자 이상이어야 합니다.";
    }

    if (
      fields.newPw !== undefined &&
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=<>?]{5,}$/.test(
        fields.newPw
      )
    ) {
      errors.newPw = "영문+숫자 포함 5자 이상이어야 합니다.";
    }

    if (
      fields.confirmPw !== undefined &&
      fields.newPw !== undefined &&
      fields.confirmPw !== fields.newPw
    ) {
      errors.confirmPw = "비밀번호가 일치하지 않습니다.";
    }

    return errors;
  };

  const handleChange = (field) => (e) => {
    const updatedForm = { ...form, [field]: e.target.value };
    setForm(updatedForm);

    const errors = validateFields(updatedForm);
    setValidationErrors(errors);
    setError("");
    setSuccess("");
  };

  const verifyCurrentPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = validateFields({ currentPw: form.currentPw });
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await axios.post("/api/myPage/selectPw", {
        memberPw: form.currentPw,
        memberNo: memberNo,
      });

      if (res.data === 1) {
        setShowNewPw(true);
        setError("");
      } else {
        setError("현재 비밀번호가 일치하지 않습니다.");
      }
    } catch {
      setError("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errors = validateFields(form);
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const res = await axios.post("/api/myPage/changePw", {
        memberPw: form.newPw,
        memberNo: memberNo,
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

  return (
    <div className={styles.container}>
      <h2>비밀번호 변경</h2>

      <AnimatePresence mode="wait">
        {!completed ? (
          <>
            <form onSubmit={verifyCurrentPassword}>
              <div>
                <label>현재 비밀번호</label>
                <input
                  type="password"
                  name="currentPw"
                  className={styles.input}
                  value={form.currentPw}
                  onChange={handleChange("currentPw")}
                />
                {validationErrors.currentPw && (
                  <p className={styles.errorMessage}>
                    {validationErrors.currentPw}
                  </p>
                )}
              </div>
              <button type="submit" className={styles.button}>
                비밀번호 확인
              </button>
            </form>

            {showNewPw && (
              <motion.form
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit}
              >
                <div>
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    name="newPw"
                    className={styles.input}
                    value={form.newPw}
                    onChange={handleChange("newPw")}
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
                    name="confirmPw"
                    className={styles.input}
                    value={form.confirmPw}
                    onChange={handleChange("confirmPw")}
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
            {success && <p className={styles.successMessage}>{success}</p>}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
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
