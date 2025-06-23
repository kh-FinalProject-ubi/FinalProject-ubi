import React, { useState } from 'react';
import "../../styles/mypage/Withdraw.css";
import { motion, AnimatePresence } from "framer-motion";

const Withdraw = () => {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false); // 👈 아코디언 상태

  const handleNextStep1 = (e) => {
    e.preventDefault();
    if (!password) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = (e) => {
    e.preventDefault();
    if (!agree) {
      alert('약관에 동의해야 다음 단계로 진행할 수 있습니다.');
      return;
    }
    setStep(3);
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="withdraw-container">
      <h2>회원 탈퇴</h2>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleNextStep1}>
          <p>탈퇴를 위해 비밀번호를 입력해주세요.</p>
          <input
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">다음</button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form onSubmit={handleNextStep2}>
          <div className="terms-box">
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
                탈퇴 후 <strong>최대 7일간 동일한 정보로 재가입이 제한</strong>됩니다.
              </li>
            </ul>

            {/* 👇 아코디언 토글 버튼 */}
            <button
              type="button"
              className="accordion-toggle"
              onClick={() => setShowFullTerms((prev) => !prev)}
            >
              {showFullTerms ? '약관 전문 닫기 ▲' : '약관 전문 보기 ▼'}
            </button>

            {/* 👇 약관 전문 영역 (접힘/펼침) */}
            <AnimatePresence>
            {showFullTerms && (
              <motion.div
                key="terms"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}  // height 애니메이션 시 필수
              >
              <div className="full-terms">
                <h4>회원 탈퇴 안내 및 동의 약관</h4>
                <p>
                  본 약관은 회원이 자발적으로 탈퇴를 신청할 경우, 탈퇴에 따른 정보 처리 및 이용 제한 사항에 대해 설명합니다.
                </p>
                <p>
                  <strong>1. 개인정보 및 서비스 이용 기록 삭제</strong><br />
                  회원 탈퇴 시 회원 정보(이름, 아이디, 이메일 등)와 개인화된 서비스 이용 이력은 개인정보 처리방침에 따라 삭제되며, 삭제된 정보는 복구되지 않습니다.
                </p>
                <p>
                  <strong>2. 계정 비활성화 및 삭제 절차</strong><br />
                  탈퇴 신청이 완료된 계정은 즉시 비활성화되며, 30일의 유예 기간 후 자동으로 영구 삭제됩니다. 이 기간 동안 재로그인은 불가능하며, 계정 복원도 불가합니다.
                </p>
                <p>
                  <strong>3. 재가입 제한</strong><br />
                  탈퇴 후에는 최대 7일 간 동일한 정보로의 재가입이 제한됩니다.
                </p>
              </div>
              </motion.div>
            )}
            </AnimatePresence>

            <label className="agreement-check">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              위 약관을 모두 읽고 동의합니다.
            </label>
          </div>
          <button type="submit">탈퇴하기</button>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="complete-step">
          <p><strong>회원 탈퇴가 완료되었습니다.</strong></p>
          <button onClick={handleGoHome}>홈으로</button>
        </div>
      )}
    </div>
  );
};

export default Withdraw;
