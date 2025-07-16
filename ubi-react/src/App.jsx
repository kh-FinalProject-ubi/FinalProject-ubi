import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AskBoard from "./pages/board/AskBoard";
import NoticeBoard from "./pages/board/NoticeBoard";
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
import FacilitySearchPage from "./pages/welfarefacility/FacilitySearchPage";
import FacilityDetailPage from "./pages/welfarefacility/FacilityDetailPage";
import EditBoard from "./pages/board/EditBoard";
import MyTownBoardWrite from "./pages/mytownboard/MyTownBoardWrite";
import LocalBenefitSection from "./components/welfareService/LocalBenefitSection";
import InsertBoard from "./pages/board/InsertBoard";
import { initAuthFromToken } from "./utils/initAuthFromToken";
import MytownBoardUpdate from "./pages/mytownboard/MytownBoardUpdate";
import WelfareDetailPage from "./pages/welfareService/WelfareDetailPage";
import SeoulWelfareDetailPage from "./pages/welfareService/SeoulWelfareDetailPage";
import FacilityJobDetailPage from "./pages/welfareService/FacilityJobDetailPage";
import LoginPage from "./components/LoginPage";

initAuthFromToken(); // ✅ 렌더 이전에 동기적으로 실행!
function App() {
  return (
    <Router>
      <Routes>
        {/* 부모 Route */}
        <Route path="/" element={<Layout />}>
          {/* 자식 Route */}
          <Route index element={<MainPage />} />
          {/* 로그인 페이지 추가 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="map" element={<WelfareMap />} />
          <Route path="askBoard" element={<AskBoard />} />
          <Route path="noticeBoard" element={<NoticeBoard />} />
          <Route path="mytownBoard" element={<MyTownBoard />} />
          <Route path="/:boardCode/write" element={<InsertBoard />} />
          <Route path="/:boardPath/:boardNo/edit" element={<EditBoard />} />
          <Route path="/:boardPath/:boardNo" element={<BoardDetail />} />
          <Route path="mytownBoard/:boardNo" element={<MyTownBoardDetail />} />
          <Route path="/facility/search" element={<FacilitySearchPage />} />
          <Route path="/facility/detail" element={<FacilityDetailPage />} />
          <Route path="mytownBoard/write" element={<MyTownBoardWrite />} />
          <Route
            path="/mytownBoard/update/:boardNo"
            element={<MytownBoardUpdate />}
          />
          <Route path="/mypage" element={<MypageLayout />}>
            <Route path="profile" element={<Profile />} />
            <Route path="chat" element={<Chat />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="withdraw" element={<Withdraw />} />
          </Route>
          <Route path="signup" element={<Signup />} />
          <Route path="mytownBoard" element={<MyTownBoard />} />
          <Route path="localBenefits" element={<LocalBenefitSection />} />
          <Route
            path="/welfareService/detail"
            element={<WelfareDetailPage />}
          />
          <Route path="/welfareDetail" element={<WelfareDetailPage />} />
          <Route
            path="/welfareDetail/:servId"
            element={<WelfareDetailPage />}
          />

          <Route path="/seoulDetail" element={<SeoulWelfareDetailPage />} />
          <Route
            path="/facilityJobDetail"
            element={<FacilityJobDetailPage />}
          />
        </Route>

        {/* 레이아웃이 필요 없는 단독 Route (예: 로그인 콜백) */}
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
      </Routes>
    </Router>
  );
}
export default App;
