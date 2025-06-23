import { Outlet, NavLink } from "react-router-dom";
import "../../styles/mypage/MypageLayout.css"; // 스타일 따로 관리 추천
// import MypageSidebar from "../../components/MypageSidebar";

function MypageLayout() {
  return (
    <div style={{ display: "flex" }}>
      {/* 사이드바 */}
      <div style={{ width: "200px", borderRight: "1px solid #eee", padding: "20px" }}>
        <h3 style={{ fontWeight: "bold", marginBottom: "20px" }}>마이페이지</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li><NavLink to="profile" className={({ isActive }) => isActive ? "active" : ""}>내 정보</NavLink></li>
          <li><NavLink to="chat">채팅</NavLink></li>
          <li><NavLink to="password">비밀번호 변경</NavLink></li>
          <li><NavLink to="withdraw">회원 탈퇴</NavLink></li>
        </ul>
      </div>

      {/* 내용 */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default MypageLayout;