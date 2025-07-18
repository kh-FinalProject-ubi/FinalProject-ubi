import React, { useState } from "react";
import WelfareMap from "../components/WelfareMap";
import PublicDataMap from "../components/PublicDataMap";
import PopularBenefitCarousel from "../components/PopularBenefitCarousel";
import PopularPostCarousel from "../components/PopularPostCarousel";
import MemberSyncProvider from "../components/MemberSyncProvider";
import styles from "../styles/MainPage.module.css";

const MainPage = () => {
  const [mapType, setMapType] = useState("welfare"); // "welfare" | "safety"

  return (
    <main className={styles.mainWrapper}>
      <section className={styles.mapSection}>
        <div className={styles.mapToggle}>
          <button
            onClick={() => setMapType("welfare")}
            className={mapType === "welfare" ? styles.active : ""}
          >
            복지 지도
          </button>
          <button
            onClick={() => setMapType("safety")}
            className={mapType === "safety" ? styles.active : ""}
          >
            치안 지도
          </button>
        </div>

        {mapType === "welfare" ? <WelfareMap /> : <PublicDataMap />}
      </section>

      <section className={styles.popularBenefitSection}>
        <h2 className={styles.sectionTitle}>많이 찜한 혜택</h2>
        <PopularBenefitCarousel />
      </section>

      <section className={styles.popularPostSection}>
        <h2 className={styles.sectionTitle}>많은 사람이 확인한 게시글</h2>
        <PopularPostCarousel />
      </section>
    </main>
  );
};

export default MainPage;
