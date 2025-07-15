import { Outlet, NavLink } from "react-router-dom";
import styles from "../../styles/mypage/MypageLayout.module.css";

function MypageLayout() {
  return (
    <div className={styles.layoutWrapper}>
      {/* 사이드바 */}
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>마이페이지</h3>
        <ul className={styles.menuList}>
          <li>
            <NavLink
              to="profile"
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              내 정보
            </NavLink>
          </li>
          <li>
            <NavLink to="chat">채팅</NavLink>
          </li>
          <li>
            <NavLink to="password">비밀번호 변경</NavLink>
          </li>
          <li>
            <NavLink to="withdraw">회원 탈퇴</NavLink>
          </li>
        </ul>
      </div>

      {/* 내용 */}
      <div className={styles.contentArea}>
        <Outlet />
      </div>
    </div>
  );
}

export default MypageLayout;
