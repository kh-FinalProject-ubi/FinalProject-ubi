import { useState, useEffect, useRef } from "react";
import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";
import useModalStore from "../stores/useModalStore";
import useAlertSocket from "../hook/alert/useAlertSocket";

const Header = () => {
  const { token, memberName, memberImg, address, clearAuth, memberNo } =
    useAuthStore();
  const isLogin = !!token;

  const { selectedCity, selectedDistrict } = useSelectedRegionStore();

  const { openLoginModal } = useModalStore();

  const navigate = useNavigate();

  //  알림 상태
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  //  WebSocket 알림 수신 연결
  useAlertSocket(memberNo, (newAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  });

  // console.log("헤더 memberImg:", memberImg);

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

  //  외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        <h1 className="logo">
          <a href="/">
            <img id="logo" src="/ubi.svg" alt="로고" />
            UBI
          </a>
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
              <button
                className="alarm-btn"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                <img src="/alarm.svg" alt="알림 아이콘" />
                {alerts.some((a) => !a.isRead) && (
                  <span className="new-badge">new</span>
                )}
              </button>

              {showDropdown && (
                <div className="alert-dropdown" ref={dropdownRef}>
                  {alerts.length === 0 ? (
                    <div className="alert-empty">알림이 없습니다</div>
                  ) : (
                    alerts.map((alert, idx) => (
                      <div
                        key={idx}
                        className="alert-item"
                        onClick={() => {
                          navigate(alert.targetUrl);
                          setShowDropdown(false);
                        }}
                      >
                        <span>{alert.type}</span> | {alert.content}
                      </div>
                    ))
                  )}
                </div>
              )}
              <button className="chatting-btn">
                <img src="/chatting.svg" alt="채팅 아이콘" />
              </button>
              <Link to="/mypage/Profile">
                <img
                  className="profile-img"
                  src={
                    memberImg
                      ? `http://localhost:8080${memberImg}`
                      : "/default-profile.png"
                  }
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
