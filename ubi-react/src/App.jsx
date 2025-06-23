import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AskBoard from "./pages/AskBoard";
import NoticeBoard from "./pages/NoticeBoard";
import WelfareService from "./pages/WelfareService";
import Header from "./components/Header";
import FacilityDetailPage from "./pages/welfarefacility/FacilityDetailPage";
import KakaoCallback from "./pages/KakaoCallback";
import WelfareMap from "./components/WelfareMap";
import Layout from "./components/Layout";
import Signup from "./pages/Signup";
import MyTownBoard from "./pages/mytownboard/MyTownBoardList";

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
          <Route path="facility" element={<FacilityDetailPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/mytownBoard" element={<MyTownBoard />} />
        </Route>

        {/* 레이아웃이 필요 없는 단독 Route (예: 로그인 콜백) */}
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
      </Routes>
    </Router>
  );
}

export default App;
