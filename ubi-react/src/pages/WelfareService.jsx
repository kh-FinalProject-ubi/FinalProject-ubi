import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import YouthPolicyList from "../components/YouthPolicyList";
import SeoulWelfare from "../components/SeoulWelfare";
import PublicDataMap from "../components/PublicDataMap";
import WelfareFacilityJobList from "../components/WelfareFacilityJobList";
import KidFacility from "../components/KidFacility";

const WelfareService = () => {
  return (
    <>
      <Header />
      <div style={{ padding: "2rem" }}>
        <h2>공공복지 서비스</h2>
        <p>
          이 페이지는 정부 및 지자체에서 제공하는 다양한 복지 서비스를 안내하는
          공간입니다.
        </p>
        <ul>
          <li>청년 지원 정책</li>
          <li>저소득층 생활 보조</li>
          <li>장애인 지원 프로그램</li>
          <li>육아·교육 관련 복지 서비스</li>
          <li>기타 지역별 맞춤형 복지</li>
        </ul>
        <p>
          위 서비스는 복지지도에서 확인하거나, 직접 검색을 통해 자세한 내용을
          확인하실 수 있습니다.
        </p>
        {/* ✅ 청년 정책 컴포넌트 */}
        <YouthPolicyList />

        {/* ✅ 서울시 공공서비스 컴포넌트 */}
        <SeoulWelfare />

        <PublicDataMap />

        {/* ✅ 취약계층 구인정보 */}
        <WelfareFacilityJobList />

        {/* 아동 시설 */}
        <KidFacility />
      </div>
      <Footer />
    </>
  );
};

export default WelfareService;
