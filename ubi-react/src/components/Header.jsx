import React from "react";
import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";
import useModalStore from "../stores/useModalStore";

const Header = () => {
  const { token, memberName, memberImg, address, clearAuth } = useAuthStore();
  const isLogin = !!token;

  const { selectedCity, selectedDistrict } = useSelectedRegionStore();

  const { openLoginModal } = useModalStore();

  const navigate = useNavigate();

  const LogoutButton = () => {
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
      logout(); // Zustand 상태 초기화
      localStorage.removeItem("kakaoId"); // 만약 남아있다면
      alert("로그아웃되었습니다.");
      window.location.href = "/"; // or navigate("/");
    };

    return <button onClick={handleLogout}>로그아웃</button>;
  };

  const handleFacilityClick = () => {
    const city = selectedCity || "서울특별시";
    const district = selectedDistrict || "종로구";

    navigate(
      `/facility/search?city=${encodeURIComponent(
        city
      )}&district=${encodeURIComponent(district)}`
    );
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <h1 className="logo">
          <a href="/">UBI</a>
        </h1>
        <nav className="nav-menu">
          <Link to="/welfareService">공공서비스</Link>
          <span onClick={handleFacilityClick} style={{ cursor: "pointer" }}>
            복지시설
          </span>
          <Link to="/mytownBoard">우리 동네 좋아요</Link>
          <Link to="/askBoard">문의게시판</Link>
          <Link to="/noticeBoard">공지사항</Link>
          <Link to="/localBenefits">지역 복지 혜택</Link> {/* 추가 */}
        </nav>

        <div className="header-right">
          {isLogin ? (
            <>
              <button className="alarm-btn">
                <img src="/alarm.svg" alt="알림 아이콘" />
              </button>
              <button className="chatting-btn">
                <img src="/chatting.svg" alt="채팅 아이콘" />
              </button>
              <Link to="/mypage/Profile">
                <img
                  className="profile-img"
                  src={memberImg || "/assets/profile.png"}
                  alt="프로필"
                />
              </Link>
              <span className="nickname">{memberName}님</span>
              <button className="logout-btn" onClick={clearAuth}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button onClick={openLoginModal}>로그인</button>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
