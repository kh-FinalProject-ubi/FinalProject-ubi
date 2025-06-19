import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import OurSigunguGood from "./pages/OurSigunguGood";
import AskBoard from "./pages/AskBoard";
import NoticeBoard from "./pages/NoticeBoard";
import WelfareService from "./pages/WelfareService";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/welfareService" element={<WelfareService />} />
        <Route path="/ourSigunguGood" element={<OurSigunguGood />} />
        <Route path="/askBoard" element={<AskBoard />} />
        <Route path="/noticeBoard" element={<NoticeBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
