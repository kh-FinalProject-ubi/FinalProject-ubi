import React from "react";
import WelfareMap from "../components/WelfareMap";
import PopularBenefitCarousel from "../components/PopularBenefitCarousel";
import PopularPostCarousel from "../components/PopularPostCarousel";
import "../styles/MainPage.css";
import MemberSyncProvider from "./../components/MemberSyncProvider";

const MainPage = () => {
  return (
    <main className="main-wrapper">
      <MemberSyncProvider />

      {/* ① 지도 + 비교 패널 */}
      <section className="map-section">
        <WelfareMap />
      </section>

      {/* ② 많이 찜한 혜택 */}
      <section className="popular-benefit-section">
        <h2 className="section-title">많이 찜한 혜택</h2>
        <PopularBenefitCarousel />
      </section>

      {/* ③ 많이 본 게시글 */}
      <section className="popular-post-section">
        <h2 className="section-title">많은 사람이 확인한 게시글</h2>
        <PopularPostCarousel />
      </section>
    </main>
  );
};

export default MainPage;
