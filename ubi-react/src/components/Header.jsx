import { useState, useEffect, useRef } from "react";
import "../styles/Header.css";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";
import useModalStore from "../stores/useModalStore";
import useAlertSocket from "../hook/alert/useAlertSocket";

const AlertModal = () => {
  const alertMessage = useModalStore((state) => state.alertMessage);
  const clearAlertMessage = useModalStore((state) => state.clearAlertMessage);
  const navigate = useNavigate();

  if (!alertMessage) return null;

  return (
    <div className="alert-modal">
      <div className="alert-content">
        <p>{alertMessage}</p>
        <button onClick={clearAlertMessage}>닫기</button>
      </div>
    </div>
  );
};

const Header = () => {
  const {
    token,
    memberName,
    memberImg,
    address,
    clearAuth,
    memberNo,
    memberNickname,
  } = useAuthStore();
  const isLogin = !!token;

  const { selectedCity, selectedDistrict } = useSelectedRegionStore();
  const { openLoginModal } = useModalStore();
  const navigate = useNavigate();

  console.log("헤더:", memberNickname);

  //  알림 상태

  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ WebSocket 알림 수신 연결 (항상 호출)
  useAlertSocket(memberNo, (newAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  });

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const LogoutButton = () => {
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
      clearAuth(); // useAuthStore에서 토큰 등 초기화
      localStorage.removeItem("kakaoId");
      alert("로그아웃되었습니다.");
      navigate("/"); // 홈으로 이동
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
    <>
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
            <Link to="/localBenefits">지역 복지 혜택</Link>
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

                <span className="nickname">{memberNickname}님</span>

                {/* 로그인 상태 */}
                <button className="logout-btn" onClick={clearAuth}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                {/* 비로그인 상태 */}
                <button onClick={() => navigate("/login")}>로그인</button>
                <Link to="/signup">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 회원 정지 알람 */}
      <AlertModal />
    </>
  );
};

export default Header;
