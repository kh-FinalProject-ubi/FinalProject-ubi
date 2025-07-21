import React, { useState, useRef, useEffect } from "react";
import DaumPostcode from "react-daum-postcode";
import { useNavigate } from "react-router-dom";

import styles from "../styles/Signup.module.css";
import useModalStore from "../stores/useModalStore";
import useAuthStore from "../stores/useAuthStore";
import TermsAndPrivacyModal from "../components/common/TermsAndPrivacyModal";

const Signup = () => {
  const [memberId, setMemberId] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const [memberPwCh, setMemberPwCh] = useState("");
  const [memberNickname, setMemberNickname] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberTel, setMemberTel] = useState("");
  const [regionCity, setRegionCity] = useState("");
  const [regionDistrict, setRegionDistrict] = useState("");
  const [postcode, setPostcode] = useState("");
  const [memberAddress, setMemberAddress] = useState("");
  const [memberTaddress, setMemberTaddress] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberStandard, setMemberStandard] = useState("일반");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [emailError, setEmailError] = useState("");
  const timerRef = useRef(null);
  const detailAddressRef = useRef(null);
  const navigate = useNavigate();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [idStatus, setIdStatus] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
const [pwMatchMessage, setPwMatchMessage] = useState("");

  const openLogin = useModalStore((state) => state.openLoginModal);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    if (!memberId) return setIdStatus("");
    const idRegex = /^[a-zA-Z0-9]{4,15}$/;
    if (!idRegex.test(memberId)) return setIdStatus("아이디는 영문/숫자 4~15자");

    setIdStatus("확인 중...");
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/member/checkId?memberId=${memberId}`);
        setIdStatus(res.ok ? "사용 가능" : "중복 아이디");
      } catch {
        setIdStatus("오류 발생");
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [memberId]);

  useEffect(() => {
    if (!memberNickname) return setNicknameStatus("");

    setNicknameStatus("확인 중...");
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/member/checkNickname?memberNickname=${memberNickname}`);
        setNicknameStatus(res.ok ? "사용 가능" : "중복 닉네임");
      } catch {
        setNicknameStatus("오류 발생");
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [memberNickname]);

  useEffect(() => {
    if (!memberPw && !memberPwCh) {
      setPwMatchMessage("");
      return;
    }
    if (memberPw === memberPwCh) {
      setPwMatchMessage("비밀번호가 일치합니다.");
    } else {
      setPwMatchMessage("비밀번호가 일치하지 않습니다.");
    }
  }, [memberPw, memberPwCh]);

  const handleSendAuthCode = async () => {
    if (!memberEmail.trim()) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`/api/member/checkEmail?email=${memberEmail}`);
      if (!res.ok) {
        setEmailError("이미 가입된 이메일입니다.");
        return;
      }
    } catch {
      setEmailError("이메일 중복 체크 실패");
      return;
    }

    setEmailError("");
    setEmailSending(true);

    try {
      const res = await fetch(`/api/member/sendAuthCode?email=${memberEmail}`, { method: "POST" });
      const data = await res.json();
      setEmailSending(false);
      setEmailSent(true);
      setAuthCode("");
      startTimer(180);
    } catch {
      setEmailSending(false);
      alert("인증번호 전송 실패");
    }
  };

  const startTimer = (seconds) => {
    clearInterval(timerRef.current);
    setTimer(seconds);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCheckAuthCode = async () => {
    if (timer === 0) return;
    try {
      const res = await fetch(`/api/member/checkAuthCode?inputCode=${authCode}`);
      if (res.ok) {
        setIsEmailVerified(true);
        clearInterval(timerRef.current);
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch {
      alert("인증번호 확인 실패");
    }
  };

  const getMemberStandardCode = (main, isDisabled, isPregnant) => {
    // 1. main이 "일반"이면 null로 처리해서 조건에 포함 안 시키기
    const category = main === "일반" ? null : main;
  
    if (!category && !isDisabled && !isPregnant) return "0"; // 일반, 임산부/장애인 없음
  
    if (isPregnant && !category && !isDisabled) return "A"; // 임산부 + 일반
    if (isPregnant && isDisabled && !category) return "B"; // 임산부 + 장애인 + 일반
  
    if (isPregnant && category === "청년") return "C";
    if (isPregnant && category === "아동") return "D";
    if (isPregnant && category === "노인") return "E";
    if (isPregnant && isDisabled && category === "노인") return "F";
  
    if (category === "노인" && isDisabled) return "4";
    if (category === "청년" && isDisabled) return "5";
    if (category === "아동" && isDisabled) return "6";
  
    if (category === "노인") return "1";
    if (category === "청년") return "2";
    if (category === "아동") return "3";
  
    if (isDisabled) return "7"; // 장애인 + 일반(카테고리 없음)
  
    return "0";
  };

  const handleComplete = (data) => {
    setPostcode(data.zonecode);
    setRegionCity(data.sido);
    setRegionDistrict(data.sigungu);
    setMemberAddress(data.roadAddress || data.jibunAddress);
    setIsPopupOpen(false);
    setTimeout(() => detailAddressRef.current?.focus(), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (memberPw !== memberPwCh) return alert("비밀번호가 일치하지 않습니다.");
    if (!memberTaddress.trim()) return alert("상세주소를 입력해주세요.");
    if (!agreeTerms || !agreePrivacy) return alert("필수 약관에 동의해주세요.");
  
    setIsSubmitting(true);
    const code = getMemberStandardCode(memberStandard, isDisabled, isPregnant);
    const formData = new FormData();
    formData.append("memberId", memberId);
    formData.append("memberPw", memberPw);
    formData.append("memberNickname", memberNickname);
    formData.append("memberName", memberName);
    formData.append("memberEmail", memberEmail);
    formData.append("memberTel", memberTel);
    formData.append("memberAddress", `${postcode}^^^${memberAddress}^^^${memberTaddress}`);
    formData.append("regionCity", regionCity);
    formData.append("regionDistrict", regionDistrict);
    formData.append("memberStandard", code);
  
    try {
      const res = await fetch("/api/member/signup", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
  
      if (res.ok && data.token) {

  +     navigate("/signup/success");
        return;
      } else {
        alert(data.message || "회원가입 실패");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className={styles.container}>
      {/* ✅ 전체적인 카드 레이아웃을 위한 mainBox 추가 */}
      <div className={styles.mainBox}>
        {/* ✅ 왼쪽 이미지 영역 추가 */}
        <div className={styles.imageBox}>
          <img src="/default-thumbnail.png" alt="회원가입 환영 이미지" />
        </div>
  
        {/* 오른쪽 폼 영역 */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <h2>Sign up</h2>
  
          {/* 아이디 */}
          <div className={styles.inputBlock}>
            <input className={styles.input} type="text" value={memberId} onChange={(e) => setMemberId(e.target.value)} placeholder="아이디" required />
            <div className={styles.statusMessage}>
              {idStatus && <span className={idStatus === "사용 가능" ? styles.valid : styles.invalid}>{idStatus}</span>}
            </div>
          </div>
  
          {/* 비밀번호 */}
          <div className={styles.inputBlock}>
          <input 
  className={styles.input} 
  type="password" 
  name="newPassword" 
  value={memberPw} 
  onChange={(e) => setMemberPw(e.target.value)} 
  placeholder="비밀번호" 
  autoComplete="new-password"
/>

          </div>
          <div className={styles.inputBlock}>
          <input 
  className={styles.input} 
  type="password" 
  name="confirmPassword" 
  value={memberPwCh} 
  onChange={(e) => setMemberPwCh(e.target.value)} 
  placeholder="비밀번호 확인" 
  autoComplete="new-password"
  onPaste={(e) => e.preventDefault()}
/>
{pwMatchMessage && (
    <div className={styles.statusMessage}>
      <span className={pwMatchMessage === "비밀번호가 일치합니다." ? styles.valid : styles.invalid}>
        {pwMatchMessage}
      </span>
    </div>
  )}
          </div>
          
          {/* 이름 */}
          <div className={styles.inputBlock}>
              <input className={styles.input} type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="이름" required />
          </div>
  
          {/* 닉네임 */}
          <div className={styles.inputBlock}>
            <input className={styles.input} type="text" value={memberNickname} onChange={(e) => setMemberNickname(e.target.value)} placeholder="닉네임" required />
            <div className={styles.statusMessage}>
              {nicknameStatus && <span className={nicknameStatus === "사용 가능" ? styles.valid : styles.invalid}>{nicknameStatus}</span>}
            </div>
          </div>
  
          {/* 전화번호 */}
          <div className={styles.inputBlock}>
              <input className={styles.input} type="text" value={memberTel} onChange={(e) => setMemberTel(e.target.value)} placeholder="전화번호" required />
          </div>
          {/* 이메일 */}
          <div className={styles.inputBlock}>
            <div className={styles.row}>
              <input className={styles.input} type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="이메일" required disabled={isEmailVerified} />
              <button type="button" className={styles.checkButton} onClick={handleSendAuthCode} disabled={emailSending || isEmailVerified}>
                {emailSending ? "전송중..." : "인증요청"}
              </button>
            </div>
            {emailError && <div className={`${styles.statusMessage} ${styles.invalid}`}>{emailError}</div>}
          </div>
  
          {emailSent && (
            <div className={styles.inputBlock}>
              <div className={styles.row}>
                <input className={styles.input} type="text" placeholder="인증번호 입력" value={authCode} onChange={(e) => setAuthCode(e.target.value)} disabled={isEmailVerified} />
                <button type="button" className={styles.checkButton} onClick={handleCheckAuthCode} disabled={isEmailVerified}>
                  확인
                </button>
              </div>
              <div className={styles.timerText}>
                {isEmailVerified ? <span className={styles.valid}>인증 완료</span> : timer > 0 ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(2, '0')}` : "시간 초과"}
              </div>
            </div>
          )}
  

          {/* 주소 */}
          <div className={styles.addressBlock}>
              <div className={styles.row}>
                  <input className={styles.input} value={postcode} placeholder="우편번호" readOnly />
                  <button type="button" onClick={() => setIsPopupOpen(true)} className={styles.checkButton}>주소검색</button>
              </div>
              <input className={styles.input} value={memberAddress} placeholder="기본 주소" readOnly />
              <input className={styles.input} ref={detailAddressRef} value={memberTaddress} onChange={(e) => setMemberTaddress(e.target.value)} placeholder="상세주소" required />
          </div>


          {/* 회원 유형 */}

<div className={styles.memberTypeBlock}>
  {/* 계층 선택 */}
  <h4>계층 대상</h4>
<div className={styles.memberTypeBlock}>
  <div className={styles.radioRow}>
    {["일반", "노인", "청년", "아동"].map((label) => (
      <label key={label} className={`${styles.radioBox} ${memberStandard === label ? styles.selected : ""}`}>
        <input 
          type="radio" 
          name="standard" 
          value={label} 
          checked={memberStandard === label} 
          onChange={(e) => setMemberStandard(e.target.value)} 
        />
        {label}
      </label>
    ))}
  </div>

  <div className={styles.checkRow}>
  <div className={styles.toggleWrapper}>
  <label className={styles.toggleSwitch}>
    <input 
      type="checkbox" 
      checked={isPregnant} 
      onChange={(e) => setIsPregnant(e.target.checked)} 
    />
    <span className={styles.slider}></span>
    <span className={styles.labelText}>임산부</span>
  </label>

  <label className={`${styles.toggleSwitch} ${styles.disabledToggle}`}>
    <input 
      type="checkbox" 
      checked={isDisabled} 
      onChange={(e) => setIsDisabled(e.target.checked)} 
    />
    <span className={styles.slider}></span>
    <span className={styles.labelText}>장애인</span>
  </label>
</div>
  </div>
</div>
</div>
          

          <div className={styles.termsBlock}>
              <label className={styles.checkboxBlock}>
                <div className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                  />
                  <span>[필수] 이용약관 동의</span>
                </div>
                {/* ✅ onClick 이벤트 핸들러 추가 */}
                <button 
                  type="button" 
                  className={styles.viewTermsBtn}
                  onClick={() => setViewingPolicy("terms")}
                >
                  자세히 보기
                </button>
              </label>

              <label className={styles.checkboxBlock}>
                <div className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={() => setAgreePrivacy(!agreePrivacy)}
                  />
                  <span>[필수] 개인정보 수집 및 이용 동의</span>
                </div>
                {/* ✅ onClick 이벤트 핸들러 추가 */}
                <button 
                  type="button" 
                  className={styles.viewTermsBtn}
                  onClick={() => setViewingPolicy("privacy")}
                >
                  자세히 보기
                </button>
              </label>

              <label className={styles.checkboxBlock}>
                <div className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={() => setAgreeMarketing(!agreeMarketing)}
                  />
                  <span>[선택] 맞춤형 혜택 동의</span>
                </div>
       
              </label>
           </div>
          
          {/* 회원가입/로그인 버튼 */}
          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={
              isSubmitting ||
              !agreeTerms || 
              !agreePrivacy ||
              !memberId.trim() ||
              !memberPw.trim() ||
              !memberPwCh.trim() ||
              memberPw !== memberPwCh ||
              !memberName.trim() ||
              !memberNickname.trim() ||
              !memberTel.trim() ||
              !memberEmail.trim() ||
              !isEmailVerified ||
              !postcode.trim() ||
              !memberAddress.trim() ||
              !memberTaddress.trim()
            }
          >
            {isSubmitting ? "가입 처리 중..." : "회원가입"}
          </button>
          <button type="button" className={styles.secondaryBtn} onClick={() => navigate("/login")}>
            로그인 페이지로
          </button>
  
        </form>
      </div>
      
      {/* 우편번호 모달 */}
      {isPopupOpen && (
          <div className={styles.postcodeModalBackdrop} onClick={() => setIsPopupOpen(false)}>
              <div className={styles.postcodeModalContent} onClick={(e) => e.stopPropagation()}>
                  <DaumPostcode onComplete={handleComplete} autoClose />
              </div>
          </div>
      )}

<TermsAndPrivacyModal
  open={!!viewingPolicy}
  view={viewingPolicy}
  onClose={() => setViewingPolicy(null)}
  onAgree={() => {
    if (viewingPolicy === "terms") setAgreeTerms(true);
    if (viewingPolicy === "privacy") setAgreePrivacy(true);
  }}
/>
    </div>

    
  
  );
};

export default Signup;
