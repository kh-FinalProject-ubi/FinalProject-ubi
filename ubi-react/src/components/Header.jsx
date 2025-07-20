import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import useChatAlertStore, { useTotalUnread } from "../stores/useChatAlertStore";
import useSelectedRegionStore from "../hook/welfarefacility/useSelectedRegionStore";
import useModalStore from "../stores/useModalStore";
import useAlertSocket from "../hook/alert/useAlertSocket";
import styles from "../styles/Header.module.css";
import ChattingAlarm from "../components/ChattingAlarm";



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
  const {
    token,
    memberImg,
    clearAuth,
    memberNo,
    memberNickname,
    memberName,
    authority,
  } = useAuthStore();

  const isLogin = !!token;
  const { selectedCity, selectedDistrict } = useSelectedRegionStore();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [hasNewAlert, setHasNewAlert] = useState(false);
  const dropdownRef = useRef(null);
  
  const rooms           = useChatAlertStore((s) => s.rooms);
  const setSelectedRoom = useChatAlertStore((s) => s.setSelectedRoom);
  const alarmOpen       = useChatAlertStore((s) => s.alarmOpen);
  const openAlarm = useChatAlertStore((state) => state.openAlarm);
  const closeAlarm      = useChatAlertStore((s) => s.closeAlarm);
  const unreadMap       = useChatAlertStore((s) => s.unreadMap);

  const totalUnread = useTotalUnread(); // 상태 변화 반영됨
  console.log("🔄 header rerender:", totalUnread);  // ✔︎ B‑1

  // 실시간 알림 수신
  useAlertSocket(memberNo, (newAlert) => {
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
    }

    setAlerts((prev) => {
      if (prev.some((a) => a.alertId === alertId)) return prev;
      return [{ ...newAlert, isRead: false, targetUrl }, ...prev];
    });

    setHasNewAlert(true);
  });

  // 채팅모달
  useEffect(() => {
    if (!alarmOpen) return;
    const onClickOutside = (e) => {
      if (!e.target.closest(`.${styles.chatAlertWrapper}`))
        useChatAlertStore.getState().closeAlarm();
    };
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, [alarmOpen]);

  // 알림 목록 불러오기
  useEffect(() => {
    if (memberNo > 0) {
      fetch(`http://localhost:8080/api/alert/list?memberNo=${memberNo}`)
        .then((res) => res.json())
        .then((data) => {
          const alertList = data.map((alert) => {
            let targetUrl = "/";
            switch (alert.type) {
              case "NOTICE":
                targetUrl = `/noticeBoard/${alert.boardNo}`;
                break;
              case "COMMENT":
                targetUrl = `/mytownBoard/${alert.boardNo}`;
                break;
              case "QUESTION_REPLY":
                targetUrl = `/askBoard/${alert.boardNo}`;
                break;
              case "WELFARE_UPDATE":
                targetUrl = `/welfare/${alert.boardNo}`;
                break;
            }
            return {
              ...alert,
              isRead: alert.isRead === 1 ? true : false, // ✅ 숫자 → boolean
              targetUrl,
            };
          });
          setAlerts(alertList);

          // ✅ 읽지 않은 게 하나라도 있으면 NEW 띄우기
          if (alertList.some((a) => !a.isRead)) {
            setHasNewAlert(true);
          }
        })
        .catch((err) => console.error("🔴 알림 목록 조회 실패:", err));
    }
  }, [memberNo]);

  // 드롭다운 외 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 알림 클릭 시 읽음 처리 + 이동
  const handleAlertClick = (alert) => {
    fetch(`http://localhost:8080/api/alert/read/${alert.alertId}`, {
      method: "PUT",
    })
      .then((res) => {
        if (!res.ok) throw new Error("읽음 처리 실패");
        setAlerts((prev) =>
          prev.map((a) =>
            a.alertId === alert.alertId ? { ...a, isRead: true } : a
          )
        );
        setShowDropdown(false);
        if (alert.targetUrl) navigate(alert.targetUrl);
      })
      .catch((err) => console.error("🔴 알림 읽음 처리 실패:", err));
  };

  // 복지시설 버튼 처리
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
        <div className={styles.topRow}>
          <h2>
            <Link to="/">
              <img className={styles.logo} src="/ubi.svg" alt="로고" />
              UBI
            </Link>
          </h2>

          <div className={styles.headerRight}>
            {isLogin ? (
              <>
                {/* ✅ 알림 아이콘 + 드롭다운을 감싸는 래퍼 */}
                <div className={styles.alarmWrapper}>
                  <button
                    className={styles.alarmBtn}
                    onClick={() => {
                      setShowDropdown((prev) => !prev);
                      setHasNewAlert(false);
                    }}
                  >
                    <img src="/alarm.svg" alt="알림 아이콘" />
                    {hasNewAlert && <span className="new-badge">NEW</span>}
                  </button>

                  {showDropdown && (
                    <div className={styles.alertDropdown} ref={dropdownRef}>
                      {alerts.filter((a) => !a.isRead).length === 0 ? (
                        <div className="alert-empty">
                          안 읽은 알림이 없습니다
                        </div>
                      ) : (
                        alerts
                          .filter((a) => !a.isRead)
                          .map((alert) => (
                            <div
                              key={alert.alertId}
                              className="alert-item"
                              onClick={() => handleAlertClick(alert)}
                            >
                              <p>
                                {alert.type === "NOTICE" &&
                                  "새로운 공지사항이 등록되었습니다."}
                                {alert.type === "COMMENT" &&
                                  "내 글에 댓글이 달렸습니다."}
                                {alert.type === "QUESTION_REPLY" &&
                                  "문의글에 답변이 등록되었습니다."}
                                {alert.type === "WELFARE_UPDATE" &&
                                  "찜한 복지 정보가 업데이트되었습니다."}
                              </p>
                            </div>
                          ))
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ 채팅 아이콘 */}
                <div className={styles.chatAlertWrapper}>
                  {/* 아이콘 + 배지 */}
                  <button className={styles.alarmBtn} onClick={openAlarm}>
                    <img src="/chatting.svg" alt="채팅" />
                    {totalUnread > 0 && (
                      <span className={styles.badge}>
                        {totalUnread > 99 ? "99+" : totalUnread}
                      </span>
                    )}
                  </button>

                  {/* 드롭다운 */}
                  {alarmOpen && (
                    <div className={styles.dropdown}>
                      <h4 className={styles.ddTitle}>새 메시지</h4>

                      {Object.keys(unreadMap).length === 0 ? (
                        <p className={styles.ddEmpty}>새 메시지가 없습니다.</p>
                      ) : (
                        Object.entries(unreadMap).map(([roomNo, cnt]) => {
                          const roomObj = rooms.find(r => r.chatRoomNo === Number(roomNo));
                          return (
                            <div
                              key={roomNo}
                              className={styles.noticeItem}
                              onClick={() => {
                                closeAlarm();
                                if (roomObj) setSelectedRoom(roomObj);
                              }}
                            >
                              <strong>{roomObj?.targetNickname || `방 #${roomNo}`}</strong>
                              <span className={styles.noticeCnt}>{cnt}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

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
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <button
                  className={styles.loginBtn}
                  onClick={() => navigate("/login?mode=login")}
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

        <div className={styles.bottomRow}>
          <nav className={styles.navMenu}>
            <NavLink
              to="/localBenefits"
              className={({ isActive }) => (isActive ? styles.active : "")}
            >
              지역 복지 혜택
            </NavLink>
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
      <ChattingAlarm />
    </>
  );
};

export default Header;
