import { Outlet, NavLink } from "react-router-dom";
import styles from "../../styles/mypage/MypageLayout.module.css";

function MypageLayout() {
  return (
     <div className={styles.pageWrap}>
      <div className={styles.inner}>
        <div className={styles.layoutWrapper}>
          {/* ── 사이드바 ─────────────────── */}
          <aside className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>마이페이지</h3>

            <ul className={styles.menuList}>
              <li><NavLink to="profile" end>내 정보</NavLink></li>
              <li><NavLink to="chat">채팅</NavLink></li>
              <li><NavLink to="password">비밀번호 변경</NavLink></li>
              <li><NavLink to="withdraw">회원 탈퇴</NavLink></li>
            </ul>
          </aside>

          {/* ── 페이지 내용 ───────────────── */}
          <main className={styles.contentArea}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default MypageLayout;
