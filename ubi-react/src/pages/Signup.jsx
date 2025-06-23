import React, { useState, useRef } from "react";
import DaumPostcode from "react-daum-postcode";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [memberStandard, setMemberStandard] = useState(""); // 노인/청년/아동
  const [isDisabled, setIsDisabled] = useState(false); // 장애인 여부
  const [profileImg, setProfileImg] = useState(null);
  const detailAddressRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (memberPw !== memberPwCh) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!memberTaddress.trim()) {
      alert("상세 주소를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    // ✅ 회원 분류 코드 계산
    let code = "0";
    if (memberStandard === "노인" && isDisabled) code = "4";
    else if (memberStandard === "청년" && isDisabled) code = "5";
    else if (memberStandard === "아동" && isDisabled) code = "6";
    else if (memberStandard === "노인") code = "1";
    else if (memberStandard === "청년") code = "2";
    else if (memberStandard === "아동") code = "3";
    else if (isDisabled) code = "7";

    // ✅ FormData 생성
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

    if (profileImg) {
      formData.append("memberImg", profileImg); // ⚠️ 백엔드에서 필드명 일치 필요
    }

    try {
      const res = await fetch("/api/member/signup", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");

      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        alert("예기치 않은 응답 형식입니다.");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "회원가입이 완료되었습니다.");
        setTimeout(() => navigate("/", { replace: true }), 0);
      } else {
        alert(data.message || "회원가입 실패");
      }
    } catch (err) {
      alert("서버 오류로 회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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

        <input
          value={postcode}
          placeholder="우편번호"
          readOnly
          onClick={() => !postcode && setIsPopupOpen(true)}
          onFocus={() => !postcode && setIsPopupOpen(true)}
        />
        <input
          value={memberAddress}
          placeholder="주소"
          readOnly
          onClick={() => !memberAddress && setIsPopupOpen(true)}
          onFocus={() => !memberAddress && setIsPopupOpen(true)}
        />
        <input
          ref={detailAddressRef}
          value={memberTaddress}
          onChange={(e) => setMemberTaddress(e.target.value)}
          placeholder="상세주소"
          required
          onClick={() => (!postcode || !memberAddress) && setIsPopupOpen(true)}
          onFocus={() => (!postcode || !memberAddress) && setIsPopupOpen(true)}
        />
        <button type="button" onClick={() => setIsPopupOpen(true)}>
          우편번호 검색
        </button>

        <h4>회원 유형 선택</h4>
        <label>
          <input
            type="radio"
            name="standard"
            value="노인"
            checked={memberStandard === "노인"}
            onChange={(e) => setMemberStandard(e.target.value)}
          />
          노인
        </label>
        <label>
          <input
            type="radio"
            name="standard"
            value="청년"
            checked={memberStandard === "청년"}
            onChange={(e) => setMemberStandard(e.target.value)}
          />
          청년
        </label>
        <label>
          <input
            type="radio"
            name="standard"
            value="아동"
            checked={memberStandard === "아동"}
            onChange={(e) => setMemberStandard(e.target.value)}
          />
          아동
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={isDisabled}
            onChange={(e) => setIsDisabled(e.target.checked)}
          />
          장애인
        </label>
        <label>
          프로필 이미지:
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProfileImg(e.target.files[0])}
          />
        </label>

        {profileImg && (
          <img
            src={URL.createObjectURL(profileImg)}
            alt="미리보기"
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              marginTop: "10px",
            }}
          />
        )}
        <br />
        <button type="submit">가입하기</button>
      </form>

      {isPopupOpen && <DaumPostcode onComplete={handleComplete} autoClose />}
    </div>
  );
};

export default Signup;
