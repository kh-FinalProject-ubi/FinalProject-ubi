// Signup.jsx
import React, { useState, useRef } from "react";
import DaumPostcode from "react-daum-postcode";
import { useNavigate } from "react-router-dom";
import TermsAndPrivacyModal from "../components/TermsAndPrivacyModal";
import "../styles/signup.css";
import useModalStore from "../stores/useModalStore";
import useAuthStore from "../stores/useAuthStore";

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
  const [memberStandard, setMemberStandard] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [authCode, setAuthCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  const detailAddressRef = useRef(null);
  const navigate = useNavigate();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [idError, setIdError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [idValid, setIdValid] = useState(null);
  const [pwValid, setPwValid] = useState(null);

  const openLogin = useModalStore((state) => state.openLoginModal);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleIdChange = (e) => {
    const val = e.target.value;
    setMemberId(val);
    const idRegex = /^[a-zA-Z]{4,15}$/;
    setIdValid(idRegex.test(val));
  };

  const handlePwChange = (e) => {
    const val = e.target.value;
    setMemberPw(val);
    const pwRegex = /^[a-zA-Z0-9]+$/;
    setPwValid(pwRegex.test(val));
  };

  const handleComplete = (data) => {
    const fullAddr = data.roadAddress || data.jibunAddress;
    setPostcode(data.zonecode);
    setRegionCity(data.sido);
    setRegionDistrict(data.sigungu);
    setMemberAddress(fullAddr);
    setIsPopupOpen(false);
    setTimeout(() => detailAddressRef.current?.focus(), 0);
  };

  const checkIdDuplicate = async (id) => {
    const res = await fetch(`/api/member/checkId?memberId=${id}`);
    return res.ok;
  };

  const checkNicknameDuplicate = async (nickname) => {
    const res = await fetch(
      `/api/member/checkNickname?memberNickname=${nickname}`
    );
    return res.ok;
  };

  const handleSendAuthCode = async () => {
    if (!memberEmail.trim()) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }
    setEmailError("");
    try {
      const res = await fetch(`/api/member/sendAuthCode?email=${memberEmail}`, {
        method: "POST",
      });
      const data = await res.json();
      alert(data.message);
      setEmailSent(true);
      setIsEmailVerified(false);
      setAuthCode("");
      startTimer(180);
    } catch {
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
    if (timer === 0) {
      alert("인증 시간이 만료되었습니다.");
      return;
    }
    try {
      const res = await fetch(
        `/api/member/checkAuthCode?inputCode=${authCode}`
      );
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setIsEmailVerified(true);
        clearInterval(timerRef.current);
      } else {
        alert(data.message);
      }
    } catch {
      alert("인증번호 확인 실패");
    }
  };

  const getMemberStandardCode = (main, isDisabled, isPregnant) => {
    if (isPregnant && !main && !isDisabled) return "A";
    if (isPregnant && isDisabled && !main) return "B";
    if (isPregnant && main === "청년") return "C";
    if (isPregnant && main === "아동") return "D";
    if (isPregnant && main === "노인") return "E";
    if (isPregnant && isDisabled && main === "노인") return "F";
    if (main === "노인" && isDisabled) return "4";
    if (main === "청년" && isDisabled) return "5";
    if (main === "아동" && isDisabled) return "6";
    if (main === "노인") return "1";
    if (main === "청년") return "2";
    if (main === "아동") return "3";
    if (isDisabled) return "7";
    return "0";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIdError("");
    setNicknameError("");
    if (isSubmitting) return;
    if (memberPw !== memberPwCh) return alert("비밀번호 불일치");
    if (!memberTaddress.trim()) return alert("상세주소 입력 필요");
    if (!agreeTerms || !agreePrivacy) return alert("약관에 모두 동의해주세요.");
    if (!idValid || !pwValid)
      return alert("아이디 또는 비밀번호 형식을 확인해주세요.");

    const isIdOk = await checkIdDuplicate(memberId);
    const isNicknameOk = await checkNicknameDuplicate(memberNickname);
    if (!isIdOk) setIdError("이미 사용 중인 아이디입니다.");
    if (!isNicknameOk) setNicknameError("이미 사용 중인 닉네임입니다.");
    if (!isIdOk || !isNicknameOk) return;

    setIsSubmitting(true);
    const code = getMemberStandardCode(memberStandard, isDisabled, isPregnant);
    const formData = new FormData();
    formData.append("memberId", memberId);
    formData.append("memberPw", memberPw);
    formData.append("memberNickname", memberNickname);
    formData.append("memberName", memberName);
    formData.append("memberEmail", memberEmail);
    formData.append("memberTel", memberTel);
    formData.append(
      "memberAddress",
      `${postcode}^^^${memberAddress}^^^${memberTaddress}`
    );
    formData.append("regionCity", regionCity);
    formData.append("regionDistrict", regionDistrict);
    formData.append("memberStandard", code);
    const kakaoId = localStorage.getItem("kakaoId");
    if (kakaoId) formData.append("kakaoId", kakaoId);

    try {
      const res = await fetch("/api/member/signup", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "회원가입 완료");
        localStorage.removeItem("kakaoId");
        setAuth({
          token: data.token,
          address: data.address,
          memberName: data.memberName,
          memberNo: data.memberNo,
        });
        navigate("/", { replace: true });
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch {
      alert("서버 오류");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>회원가입</h2>
      <form className="signup-form" onSubmit={handleSubmit}>
        {/* ✅ 아이디 입력 */}
        <input
          type="text"
          value={memberId}
          onChange={handleIdChange}
          placeholder="아이디"
          required
        />
        {idValid === false && (
          <div style={{ color: "red", fontSize: "13px" }}>
            입력이 정확하지 않습니다. 아이디는 영문자 4자 이상 15자 미만이어야
            합니다.
          </div>
        )}
        {idValid === true && (
          <div style={{ color: "green", fontSize: "13px" }}>
            적합한 아이디입니다.
          </div>
        )}
        {idError && <span style={{ color: "red" }}>{idError}</span>}

        {/* ✅ 비밀번호 입력 */}
        <input
          type="password"
          value={memberPw}
          onChange={handlePwChange}
          placeholder="비밀번호"
          required
        />
        {pwValid === false && (
          <div style={{ color: "red", fontSize: "13px" }}>
            입력이 정확하지 않습니다. 비밀번호는 영문자와 숫자만 사용할 수
            있습니다.
          </div>
        )}
        {pwValid === true && (
          <div style={{ color: "green", fontSize: "13px" }}>
            적합한 비밀번호입니다.
          </div>
        )}

        {/* 비밀번호 확인 */}
        <input
          type="password"
          value={memberPwCh}
          onChange={(e) => setMemberPwCh(e.target.value)}
          placeholder="비밀번호 확인"
          required
        />
        <input
          type="text"
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          placeholder="이름"
          required
        />
        <input
          type="text"
          value={memberNickname}
          onChange={(e) => setMemberNickname(e.target.value)}
          placeholder="닉네임"
          required
        />
        {nicknameError && <span style={{ color: "red" }}>{nicknameError}</span>}

        <div className="form-row">
          <input
            type="email"
            value={memberEmail}
            onChange={(e) => {
              setMemberEmail(e.target.value);
              setEmailError(""); // 입력 중이면 에러 제거
            }}
            placeholder="이메일"
            required
          />
          <button
            type="button"
            className="check-button"
            onClick={handleSendAuthCode}
          >
            인증번호 발송
          </button>
        </div>

        {emailError && (
          <p style={{ color: "red", fontSize: "13px", marginTop: "-8px" }}>
            {emailError}
          </p>
        )}

        {emailSent && (
          <>
            <div className="form-row">
              <input
                type="text"
                placeholder="인증번호 입력"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                disabled={timer === 0 || isEmailVerified}
              />
              <button
                type="button"
                className="check-button"
                onClick={handleCheckAuthCode}
                disabled={timer === 0 || isEmailVerified}
              >
                확인
              </button>
            </div>
            <p className="timer-text">
              {isEmailVerified ? (
                <span style={{ color: "green" }}>이메일 인증 완료</span>
              ) : timer > 0 ? (
                <>
                  남은 시간: {Math.floor(timer / 60)}:
                  {String(timer % 60).padStart(2, "0")}
                </>
              ) : (
                <span style={{ color: "red" }}>⏰ 인증 시간 만료</span>
              )}
            </p>
          </>
        )}

        <input
          type="text"
          value={memberTel}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, ""); // 숫자 이외 제거
            if (value.length <= 11) setMemberTel(value);
          }}
          placeholder="전화번호 (숫자만 입력)"
          required
        />
        <div>
          <button type="button" onClick={() => setIsPopupOpen(true)}>
            우편번호 검색
          </button>

          <input
            value={postcode}
            type="text"
            placeholder="우편번호"
            readOnly
            style={{ backgroundColor: "#f1f1f1", cursor: "default" }}
          />
          <input
            value={memberAddress}
            type="text"
            placeholder="기본 주소"
            readOnly
            style={{ backgroundColor: "#f1f1f1", cursor: "default" }}
          />
          <input
            ref={detailAddressRef}
            value={memberTaddress}
            type="text"
            onChange={(e) => setMemberTaddress(e.target.value)}
            placeholder="상세주소 (예: 101동 1001호)"
            required
          />
        </div>

        {isPopupOpen && (
          <DaumPostcode
            onComplete={handleComplete}
            autoClose
            style={{ zIndex: 1000, position: "absolute" }} // 필요시 스타일 추가
          />
        )}
        <h4>회원 유형 선택</h4>
        <div className="member-type-block">
          <div className="radio-row">
            {["노인", "청년", "아동"].map((label) => (
              <label
                key={label}
                className={`radio-box ${
                  memberStandard === label ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="standard"
                  value={label}
                  checked={memberStandard === label}
                  onClick={(e) => {
                    if (memberStandard === label) {
                      setMemberStandard("");
                    } else {
                      setMemberStandard(label);
                    }
                  }}
                  readOnly
                />
                {label}
              </label>
            ))}
          </div>

          <div className="toggle-wrapper">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isDisabled}
                onChange={(e) => setIsDisabled(e.target.checked)}
              />
              <span className="toggle-custom" />
              <span className="toggle-text">장애인 여부</span>
            </label>
          </div>
          <div className="toggle-wrapper">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isPregnant}
                onChange={(e) => setIsPregnant(e.target.checked)}
              />
              <span className="toggle-custom" />
              <span className="toggle-text">임산부 여부</span>
            </label>
          </div>
        </div>
        {/* 약관 체크박스 및 자세히 보기 */}
        <div>
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={() => setAgreeTerms(!agreeTerms)}
          />
          (필수) 이용약관 동의
          <button type="button" onClick={() => setViewingPolicy("terms")}>
            자세히 보기
          </button>
        </div>
        <div>
          <input
            type="checkbox"
            checked={agreePrivacy}
            onChange={() => setAgreePrivacy(!agreePrivacy)}
          />
          (필수) 개인정보 수집 및 이용 동의
          <button type="button" onClick={() => setViewingPolicy("privacy")}>
            자세히 보기
          </button>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={
            isSubmitting ||
            !isEmailVerified ||
            memberPw !== memberPwCh ||
            memberTaddress.trim() === "" ||
            !agreeTerms ||
            !agreePrivacy
          }
        >
          가입하기
        </button>
        <button type="button" className="secondary-button" onClick={openLogin}>
          로그인 하러 가기
        </button>
      </form>

      {isPopupOpen && <DaumPostcode onComplete={handleComplete} autoClose />}
      <TermsAndPrivacyModal
        open={!!viewingPolicy}
        onClose={() => setViewingPolicy(null)}
        view={viewingPolicy}
      />
    </div>
  );
};

export default Signup;
