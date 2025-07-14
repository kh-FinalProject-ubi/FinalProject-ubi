import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";
import useModalStore from "../stores/useModalStore";
import useAlertSocket from "../hook/alert/useAlertSocket";
import styles from "../styles/Header.module.css";

const AlertModal = () => {
  const alertMessage = useModalStore((state) => state.alertMessage);
  const clearAlertMessage = useModalStore((state) => state.clearAlertMessage);

  if (!alertMessage) return null;

  return (
    <div className={styles.alertModal}>
      <div className={styles.alertContent}>
        <p>{alertMessage}</p>
        <button onClick={clearAlertMessage}>닫기</button>
      </div>
    </div>
  );
};

const Header = () => {
  const { token, memberImg, clearAuth, memberNo, memberNickname } =
    useAuthStore();
  const isLogin = !!token;

  const { selectedCity, selectedDistrict } = useSelectedRegionStore();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useAlertSocket(memberNo, (newAlert) => {
    setAlerts((prev) => [newAlert, ...prev]);
  });

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <header className={styles.siteHeader}>
        {/* 1. 상단 영역: 로고와 사용자 정보 */}
        <div className={styles.topRow}>
          <h2>
            <a href="/">
              <img className={styles.logo} src="/ubi.svg" alt="로고" />
              UBI
            </a>
          </h2>

          <div className={styles.headerRight}>
            {isLogin ? (
              <>
                <div style={{ position: "relative" }}>
                  <button
                    className={styles.alarmBtn}
                    onClick={() => setShowDropdown((prev) => !prev)}
                  >
                    <img src="/alarm.svg" alt="알림 아이콘" />
                    {alerts.some((a) => !a.isRead) && (
                      <span className={styles.newBadge}>new</span>
                    )}
                  </button>

                  {showDropdown && (
                    <div className={styles.alertDropdown} ref={dropdownRef}>
                      {alerts.length === 0 ? (
                        <div className={styles.alertEmpty}>알림이 없습니다</div>
                      ) : (
                        alerts.map((alert, idx) => (
                          <div
                            key={idx}
                            className={styles.alertItem}
                            onClick={() => {
                              navigate(alert.targetUrl);
                              setShowDropdown(false);
                            }}
                          >
                            <p>{alert.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <button className={styles.alarmBtn}>
                  <img src="/chatting.svg" alt="채팅 아이콘" />
                </button>

                <Link to="/mypage/Profile">
                  <img
                    className={styles.profileImg}
                    src={
                      memberImg
                        ? `http://localhost:8080${memberImg}`
                        : "/default-profile.png"
                    }
                    alt="프로필"
                  />
                </Link>

                <span className={styles.nickname}>{memberNickname}님</span>

                <button className={styles.logoutBtn} onClick={clearAuth}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.loginBtn}
                  onClick={() => navigate("/login")}
                >
                  로그인
                </button>
                <Link to="/signup" className={styles.signupLink}>
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>

        {/* 2. 하단 영역: 메뉴와 지역 선택 */}
        <div className={styles.bottomRow}>
          <nav className={styles.navMenu}>
            <NavLink
              to={`/facility/search?city=${encodeURIComponent(
                selectedCity || "서울특별시"
              )}&district=${encodeURIComponent(selectedDistrict || "종로구")}`}
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              복지시설
            </NavLink>
            <NavLink
              to="/mytownBoard"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              우리 동네 좋아요
            </NavLink>
            <NavLink
              to="/askBoard"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              문의게시판
            </NavLink>
            <NavLink
              to="/noticeBoard"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              공지사항
            </NavLink>
          </nav>
          <div className={styles.locationSelector}>
            <span>
              {selectedCity || "서울시"} {selectedDistrict || "종로구"} ▼
            </span>
          </div>
        </div>
      </header>

      {/* 회원 정지 알람 */}
      <AlertModal />
    </>
  );
};

export default Header;
