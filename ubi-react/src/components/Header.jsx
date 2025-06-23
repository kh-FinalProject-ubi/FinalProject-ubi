import React, { useState } from "react";
import "../styles/Header.css";
import AskBoard from "../pages/AskBoard";
import NoticeBoard from "../pages/NoticeBoard";
import WelfareService from "./../pages/WelfareService";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import LoginModal from "./LoginModal"; // ✅ 팝업 컴포넌트 import


const Header = () => {
  const { token, address, memberName, clearAuth } = useAuthStore();
  const isLogin = !!token; // 토큰 존재 여부로 로그인 상태 판단


  const navigate = useNavigate();

  const handleFacilityClick = () => {
    const city = "서울특별시";
    const district = "성북구";
    navigate(
      `/facility?city=${encodeURIComponent(city)}&district=${encodeURIComponent(
        district
      )}`
    );
  };

  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ 팝업 상태

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
          <Link to="/mytownboard">우리 동네 좋아요</Link>
          <Link to="/askBoard">문의게시판</Link>
          <Link to="/noticeBoard">공지사항</Link>
        </nav>
        <div className="header-right">
          {isLogin ? (
            <>
              <button className="alarm-btn">🔔</button>
              <span className="nickname">{memberName}님</span>
              <Link to="/mypage/Profile">
              <img
                className="profile-img"
                src="/assets/profile.png"
                alt="프로필"
              />
              </Link>

              <button className="logout-btn" onClick={clearAuth}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowLoginModal(true)}>로그인</button>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </div>
      </div>

      {/* ✅ 로그인 팝업 표시 */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </header>
  );
};

export default Header;
