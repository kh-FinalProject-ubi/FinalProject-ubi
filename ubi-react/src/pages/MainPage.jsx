import React, { useState } from "react";
import WelfareMap from "../components/WelfareMap";
import PublicDataMap from "../components/PublicDataMap";
import PopularBenefitCarousel from "../components/PopularBenefitCarousel";
import PopularPostCarousel from "../components/PopularPostCarousel";
import "../styles/MainPage.module.css";
import MemberSyncProvider from "../components/MemberSyncProvider";

const MainPage = () => {
  const [mapType, setMapType] = useState("welfare"); // "welfare" | "safety"

  return (
    <main className="main-wrapper">
      <MemberSyncProvider />

      {/* ① 지도 + 토글 */}
      <section className="map-section">
        <div className="map-toggle">
          <button
            onClick={() => setMapType("welfare")}
            className={mapType === "welfare" ? "active" : ""}
          >
            복지 지도
          </button>
          <button
            onClick={() => setMapType("safety")}
            className={mapType === "safety" ? "active" : ""}
          >
            치안 지도
          </button>
        </div>

        {mapType === "welfare" ? <WelfareMap /> : <PublicDataMap />}
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
