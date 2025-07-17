// ▶ src/pages/mypage/Withdraw.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/mypage/Withdraw.module.css";

const Withdraw = () => {
  const { memberNo, clearAuth } = useAuthStore();

  /* ----------------- 상태 ----------------- */
  const [form, setForm] = useState({ currentPw: "" });
  const [agree, setAgree] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);

  /* ----------------- 유효성 ----------------- */
  const validatePw = (pw) =>
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=<>?]{5,}$/.test(pw);

  const canWithdraw = agree && validatePw(form.currentPw);

  /* ----------------- 입력 ----------------- */
  const handleChange = (e) => {
    const value = e.target.value;
    setForm({ currentPw: value });

    // 실시간 에러
    if (value && !validatePw(value)) {
      setValidationErrors({
        currentPw: "영문+숫자 포함 5자 이상이어야 합니다.",
      });
    } else {
      setValidationErrors({});
    }
    setError("");
  };

  /* ----------------- 탈퇴 처리 ----------------- */
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!canWithdraw) return;

    // 1) 비밀번호 검증
    try {
      const verify = await axios.post("/api/myPage/selectPw", {
        memberPw: form.currentPw,
        memberNo,
      });
      if (verify.data !== 1) {
        setError("비밀번호가 일치하지 않습니다.");
        return;
      }
    } catch {
      setError("비밀번호 확인 중 오류가 발생했습니다.");
      return;
    }

    // 2) 탈퇴 최종 확인
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;

    try {
      const res = await axios.post("/api/myPage/withdraw", { memberNo });
      if (res.data === 1) {
        setCompleted(true);
        clearAuth();               // Zustand 초기화
        localStorage.removeItem("kakaoId");
      } else {
        setError("회원 탈퇴에 실패했습니다.");
      }
    } catch {
      setError("회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  /* ----------------- 완료 카운트다운 ----------------- */
  useEffect(() => {
    if (!completed) return;

    const duration = 5000, interval = 50;
    let tick = 0;
    const timer = setInterval(() => {
      tick++;
      if (tick % (1000 / interval) === 0)
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      setProgress(Math.min((tick / (duration / interval)) * 100, 100));
      if (tick >= duration / interval) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [completed]);

  useEffect(() => {
    if (progress >= 100 && completed) window.location.href = "/";
  }, [progress, completed]);

  /* ----------------- 렌더 ----------------- */
  return (
    <div className={styles.withdrawContainer}>
      <h2>회원 탈퇴</h2>

      {/* ── ① 약관 확인 + 비밀번호 입력 ───────────────── */}
      {!completed && (
        <form onSubmit={handleWithdraw}>
          {/* 약관 안내 & 동의 */}
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
              onClick={() => setShowFullTerms((p) => !p)}
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
                  transition={{ duration: 0.3 }}
                  style={{ overflow: "hidden" }}
                >
                  <div className={styles.fullTerms}>
                    <h4>회원 탈퇴 안내 및 동의 약관</h4>

                    <p>
                      본 약관은 &lt;UBI&gt;(<em>이하 "우리동네 비교 사이트 : 우비"</em>) 회원이 자발적으로 탈퇴를
                      신청할 때 적용되며, 탈퇴 절차·효과·책임에 관해 규정합니다. 회원은 탈퇴
                      신청 전 반드시 본 약관을 충분히 읽고 이해한 후 진행해 주시기 바랍니다.
                    </p>

                    <br /><br />

                    <ol>
                      <li>
                        <strong>탈퇴 신청</strong><br />
                        ① 회원은 서비스 내 “회원 탈퇴” 메뉴를 통해 본인 확인(비밀번호 입력 등)을
                        완료한 뒤 탈퇴를 신청할 수 있습니다.<br />
                        ② 탈퇴 신청이 접수되면 즉시 계정이 <em>비활성화</em>되며,
                        로그인·서비스 이용·개인화 기능이 중지됩니다.
                      </li>

                      <br />

                      <li>
                        <strong>개인정보 및 데이터 삭제</strong><br />
                        ① 회사는 개인정보 보호법 등 관계 법령과 개인정보처리방침에 따라 회원의
                        개인정보 및 서비스 이용 기록을 <em>삭제 또는 익명화</em>합니다.<br />
                        ② 삭제된 정보는 <em>복구가 불가능</em>하며, 법적 의무가 있는 특정 자료
                        (전자상거래 주문·결제 내역 등)는 법령이 정한 보존 기간 동안 별도 분리
                        보관될 수 있습니다.
                      </li>

                      <br />

                      <li>
                        <strong>계정 영구 삭제</strong><br />
                        ① 비활성화된 계정은 <em>30일간</em> 보존되며, 해당 기간 동안 회원 요청에
                        따라 탈퇴 철회(계정 복구)가 가능합니다.<br />
                        ② 30일이 경과하면 계정은 <em>자동으로 영구 삭제</em>되며, 이후에는
                        어떠한 방법으로도 복구할 수 없습니다.
                      </li>

                      <br />

                      <li>
                        <strong>재가입 제한</strong><br />
                        ① 영구 삭제 완료 후에도 <em>최대 7일</em>간 동일한 이메일·연락처·휴대전화
                        번호 등 <em>식별 정보</em>로는 재가입이 제한됩니다.<br />
                        ② 이용자가 회원 규정 위반 등으로 서비스 이용이 제한된 상태에서 탈퇴한
                        경우, 회사는 서비스 운영 정책에 따라 더 장기간 재가입을 제한할 수
                        있습니다.
                      </li>

                      <br />

                      <li>
                        <strong>책임 및 면책</strong><br />
                        ① 탈퇴로 인해 발생하는 모든 불이익은 회원 본인에게 귀속되며,
                        회사는 관계 법령에 따른 책임을 제외하고 추가 책임을 지지 않습니다.<br />
                        ② 회원이 타인의 권리를 침해하거나 법령을 위반한 사실이 있는 경우,
                        탈퇴 이후라도 해당 사실의 법적 책임은 면책되지 않습니다.
                      </li>

                      <br />

                      <li>
                        <strong>기타</strong><br />
                        ① 본 약관에서 정하지 아니한 사항은 서비스 이용약관·개인정보처리방침 및
                        관계 법령에 따릅니다.<br />
                        ② 회사는 운영상·법령상 필요에 따라 본 약관을 변경할 수 있으며,
                        변경 시 사전에 서비스 공지사항 등을 통해 고지합니다.
                      </li>
                    </ol>

                    <br />

                    <p style={{ marginTop: "1rem" }}>
                      <strong>
                        위 약관을 모두 읽고, 회원 탈퇴로 인한 모든 사항(개인정보 삭제, 재가입
                        제한 등)에 동의합니다.
                      </strong>
                    </p>
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

          {/* 비밀번호 입력 */}
          <label className={styles.pwLabel}>비밀번호 확인</label>
          <input
            type="password"
            value={form.currentPw}
            placeholder="비밀번호를 입력해주세요."
            onChange={handleChange}
            disabled={!agree} /* 동의 전엔 입력 잠금 */
            className={styles.pwInput}
          />
          {validationErrors.currentPw && (
            <p className={styles.error}>{validationErrors.currentPw}</p>
          )}
          {error && <p className={styles.error}>{error}</p>}

          {/* 탈퇴 버튼 */}
          <button
            type="submit"
            disabled={!canWithdraw}
            className={canWithdraw ? styles.activeBtn : styles.disabledBtn}
          >
            탈퇴하기
          </button>
        </form>
      )}

      {/* ── ② 완료 화면 ──────────────────────────────── */}
      {completed && (
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
          <button onClick={() => (window.location.href = "/")}>홈으로</button>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
