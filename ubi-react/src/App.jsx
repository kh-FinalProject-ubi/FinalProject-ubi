import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AskBoard from "./pages/board/AskBoard";
import NoticeBoard from "./pages/board/NoticeBoard";
import WelfareService from "./pages/WelfareService";
import KakaoCallback from "./pages/KakaoCallback";
import WelfareMap from "./components/WelfareMap";
import Layout from "./components/Layout";
import Signup from "./pages/Signup";
import MyTownBoard from "./pages/mytownboard/MyTownBoardList";
import MypageLayout from "./pages/mypage/MyPageLayout";
import Profile from "./pages/mypage/Profile";
import Chat from "./pages/mypage/Chat";
import ChangePassword from "./pages/mypage/ChangePassword";
import Withdraw from "./pages/mypage/Withdraw";
import BoardDetail from "./pages/board/BoardDetail";
import MyTownBoardDetail from "./pages/mytownboard/MyTownBoardDetail";
import FacilityRouter from "./pages/welfarefacility/FacilityRouter";
import EditBoard from "./pages/board/EditBoard";

function App() {
  return (
    <Router>
      <Routes>
        {/* 부모 Route */}
        <Route path="/" element={<Layout />}>
          {/* 자식 Route */}
          <Route index element={<MainPage />} />
          <Route path="map" element={<WelfareMap />} />
          <Route path="welfareService" element={<WelfareService />} />
          <Route path="askBoard" element={<AskBoard />} />
          <Route path="noticeBoard" element={<NoticeBoard />} />
          <Route path="mytownBoard" element={<MyTownBoard />} />
          <Route path="mytownBoard/:boardNo" element={<MyTownBoardDetail />} />
          <Route path="facility" element={<FacilityRouter />} />
          <Route path="/mypage" element={<MypageLayout />}>
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="withdraw" element={<Withdraw />} />
          </Route>
          <Route path="signup" element={<Signup />} />
          <Route path="mytownBoard" element={<MyTownBoard />} />
          <Route path="/:boardPath/detail/:boardNo" element={<BoardDetail />} />
          <Route
            path="/editBoard/:boardCode/:boardNo"
            element={<EditBoard />}
          />
        </Route>

        {/* 레이아웃이 필요 없는 단독 Route (예: 로그인 콜백) */}
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
      </Routes>
    </Router>
  );
}
export default App;
