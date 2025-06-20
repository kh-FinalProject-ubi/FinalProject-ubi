import React, { useState } from "react";
import DaumPostcode from "react-daum-postcode";
import useAuthStore from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const handleComplete = (data) => {
    const fullAddr = data.roadAddress || data.jibunAddress;
    setPostcode(data.zonecode);
    setRegionCity(data.sido);
    setRegionDistrict(data.sigungu);
    setMemberAddress(fullAddr);
    setIsPopupOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (memberPw !== memberPwCh) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const payload = {
      memberId,
      memberPw,
      memberPwCh,
      memberNickname,
      memberName,
      memberEmail,
      memberTel,
      memberAddress: `${postcode}^^^${memberAddress}^^^${memberTaddress}`,
      regionCity,
      regionDistrict,
      memberStandard: "N",
    };

    try {
      const res = await fetch("/api/member/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        navigate("/");
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (err) {
      console.error("회원가입 오류:", err);
      alert("서버 오류로 회원가입에 실패했습니다.");
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          placeholder="아이디"
          required
        />
        <input
          type="password"
          value={memberPw}
          onChange={(e) => setMemberPw(e.target.value)}
          placeholder="비밀번호"
          required
        />
        <input
          type="password"
          value={memberPwCh}
          onChange={(e) => setMemberPwCh(e.target.value)}
          placeholder="비밀번호 확인"
          required
        />
        <input
          value={memberName}
          onChange={(e) => setMemberName(e.target.value)}
          placeholder="이름"
          required
        />
        <input
          value={memberNickname}
          onChange={(e) => setMemberNickname(e.target.value)}
          placeholder="닉네임"
          required
        />
        <input
          type="email"
          value={memberEmail}
          onChange={(e) => setMemberEmail(e.target.value)}
          placeholder="이메일"
          required
        />
        <input
          value={memberTel}
          onChange={(e) => setMemberTel(e.target.value)}
          placeholder="전화번호"
          required
        />
        <input value={postcode} placeholder="우편번호" readOnly />
        <input value={memberAddress} placeholder="주소" readOnly />
        <input
          value={memberTaddress}
          onChange={(e) => setMemberTaddress(e.target.value)}
          placeholder="상세주소"
          required
        />
        <button type="button" onClick={() => setIsPopupOpen(true)}>
          우편번호 검색
        </button>
        <button type="submit">가입하기</button>
      </form>
      {isPopupOpen && <DaumPostcode onComplete={handleComplete} autoClose />}
    </div>
  );
};

export default Signup;
