import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import OurSigunguGood from "../pages/OurSigunguGood";
import AskBoard from "../pages/AskBoard";
import NoticeBoard from "../pages/NoticeBoard";
import WelfareService from "./../pages/WelfareService";
const Header = () => {
  return (
    <header className="site-header">
      <h1>
        <a href="/">UBI</a>
      </h1>
      <nav>
        <Link to="/welfareService">공공서비스</Link>
        <Link to="/ourSigunguGood">우리 동네 좋아요</Link>
        <Link to="/askBoard">문의게시판</Link>
        <Link to="/noticeBoard">공지사항</Link>
      </nav>
    </header>
  );
};

export default Header;
