import React from "react";
import "../styles/Header.css";
import OurSigunguGood from "../pages/OurSigunguGood";
import AskBoard from "../pages/AskBoard";
import NoticeBoard from "../pages/NoticeBoard";
import WelfareService from "./../pages/WelfareService";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const { isLogin, userInfo, logout } = useAuth();

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
          <Link to="/ourSigunguGood">우리 동네 좋아요</Link>
          <Link to="/askBoard">문의게시판</Link>
          <Link to="/noticeBoard">공지사항</Link>
        </nav>
        <div className="header-right">
          {isLogin ? (
            <>
              <button className="alarm-btn">🔔</button>
              <span className="nickname">{userInfo?.nickname}님</span>
              <img
                className="profile-img"
                src={userInfo?.profileImg || "/assets/profile.png"}
                alt="프로필"
              />
              <button className="logout-btn" onClick={logout}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login">로그인</Link>
              <Link to="/signup">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
