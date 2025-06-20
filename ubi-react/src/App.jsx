import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import OurSigunguGood from "./pages/OurSigunguGood";
import AskBoard from "./pages/AskBoard";
import NoticeBoard from "./pages/NoticeBoard";
import WelfareService from "./pages/WelfareService";
import Header from "./components/Header";
import FacilityDetailPage from "./pages/welfarefacility/FacilityDetailPage";
import KakaoCallback from "./pages/KakaoCallback";


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/welfareService" element={<WelfareService />} />
        <Route path="/ourSigunguGood" element={<OurSigunguGood />} />
        <Route path="/askBoard" element={<AskBoard />} />
        <Route path="/noticeBoard" element={<NoticeBoard />} />
        <Route path="/facility" element={<FacilityDetailPage />} />
        <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />

      </Routes>
    </Router>
  );
}

export default App;
