import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";
import useModalStore from "../stores/useModalStore";
import useAlertSocket from "../hook/alert/useAlertSocket";
import styles from "../styles/Header.module.css";

// 알림 모달
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

  // 알림 수신
  useAlertSocket(memberNo, (newAlert) => {
    console.log("📩 수신된 알림:", newAlert);

    const { type, boardNo, alertId } = newAlert;

    let targetUrl = "/";
    switch (type) {
      case "NOTICE":
        targetUrl = `/noticeBoard/${boardNo}`;
        break;
      case "COMMENT":
        targetUrl = `/mytownBoard/${boardNo}`;
        break;
      case "QUESTION_REPLY":
        targetUrl = `/askBoard/${boardNo}`;
        break;
      case "WELFARE_UPDATE":
        targetUrl = `/welfare/${boardNo}`;
        break;
      default:
        console.warn("⚠️ 알 수 없는 알림 타입:", type);
    }
    console.log("📬 수신된 알림:", newAlert);
    // ✅ 중복 alertId는 추가하지 않음
    setAlerts((prev) => {
      if (prev.some((a) => a.alertId === alertId)) {
        return prev;
      }
      return [{ ...newAlert, targetUrl }, ...prev];
    });
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

  // 복지시설 버튼 클릭
  const handleFacilityClick = () => {
    const city = selectedCity || "서울특별시";
    const district = selectedDistrict || "종로구";
    navigate(
      `/facility/search?city=${encodeURIComponent(
        city
      )}&district=${encodeURIComponent(district)}`
    );
  };

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem("kakaoId");
    alert("로그아웃되었습니다.");
    navigate("/");
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
                <button
                  className={styles.alarmBtn}
                  onClick={() => setShowDropdown((prev) => !prev)}
                >
                  <img src="/alarm.svg" alt="알림 아이콘" />
                  {alerts.some((a) => !a.isRead) && (
                    <span className="new-badge">new</span>
                  )}
                </button>

                {showDropdown && (
                  <div className={styles.alertDropdown} ref={dropdownRef}>
                    {alerts.length === 0 ? (
                      <div className="alert-empty">알림이 없습니다</div>
                    ) : (
                      alerts.map((alert) => (
                        <div
                          key={alert.alertId}
                          className="alert-item"
                          onClick={() => {
                            console.log("🧪 클릭한 alertId:", alert.alertId);
                            console.log("🧪 현재 alerts 목록:", alerts);
                            if (alert.targetUrl) {
                              navigate(alert.targetUrl);
                            }
                            setAlerts((prev) =>
                              prev.filter((a) => a.alertId !== alert.alertId)
                            );
                            setShowDropdown(false);
                          }}
                        >
                          <p>{alert.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

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

      <AlertModal />
    </>
  );
};

export default Header;
