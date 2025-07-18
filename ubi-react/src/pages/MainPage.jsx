import React, { useState } from "react";
import WelfareMap from "../components/WelfareMap";
import PopularBenefitCarousel from "../components/PopularBenefitCarousel";
import PopularPostCarousel from "../components/PopularPostCarousel";
import styles from "../styles/MainPage.module.css";
import CrimeSafetyMap from "./../components/PublicDataMap";

const layerConfig = {
  전체: {
    layername: "A2SM_CRMNLHSPOT_F1_TOT",
    styles: "A2SM_OdblrCrmnlHspot_Tot_20_24",
  },
  성폭력: {
    layername: "A2SM_CRMNLHSPOT_F1_RAPE",
    styles: "A2SM_OdblrCrmnlHspot_Rape_20_24",
  },
  폭력: {
    layername: "A2SM_CRMNLHSPOT_F1_VIOLN",
    styles: "A2SM_OdblrCrmnlHspot_Violn_20_24",
  },
  절도: {
    layername: "A2SM_CRMNLHSPOT_F1_THEFT",
    styles: "A2SM_OdblrCrmnlHspot_Theft_20_24",
  },
  강도: {
    layername: "A2SM_CRMNLHSPOT_F1_BRGLR",
    styles: "A2SM_OdblrCrmnlHspot_Brglr_20_24",
  },
};

const MainPage = () => {
  const [mapType, setMapType] = useState("welfare"); // "welfare" | "safety"

  // 치안지도 컨트롤 상태
  const [showHybrid, setShowHybrid] = useState(true);
  const [selectedCrime, setSelectedCrime] = useState("전체");

  return (
    <main className={styles.mainWrapper}>
      <section className={styles.mapSection}>
        <div className={styles.mapHeaderRow}>
          {/* 왼쪽: 제목 + 체크박스 */}
          <div className={styles.titleAndCheckbox}>
            <h2 className={styles.mapTitle}>
              {mapType === "welfare" ? "복지 혜택 지도" : "범죄지도 히트맵"}
            </h2>
          </div>

          {/* 오른쪽: 복지/치안 토글 버튼 */}
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

          {/* 범죄 유형 버튼 그룹은 한 줄 내려서 전체 너비 */}
          {mapType === "safety" && (
            <div className={styles.buttonGroupBelow}>
              {Object.keys(layerConfig).map((crime) => (
                <button
                  key={crime}
                  onClick={() => setSelectedCrime(crime)}
                  className={`${styles.crimeButton} ${
                    selectedCrime === crime ? styles.crimeButtonActive : ""
                  }`}
                >
                  {crime}
                </button>
              ))}

              {mapType === "safety" && (
                <label className={styles.labelToggle}>
                  <input
                    type="checkbox"
                    checked={showHybrid}
                    onChange={() => setShowHybrid((prev) => !prev)}
                  />
                  지명 표시
                </label>
              )}
            </div>
          )}
        </div>

        {/* 지도 영역 */}
        {mapType === "welfare" ? (
          <WelfareMap />
        ) : (
          <CrimeSafetyMap
            showHybrid={showHybrid}
            setShowHybrid={setShowHybrid}
            selectedCrime={selectedCrime}
            setSelectedCrime={setSelectedCrime}
          />
        )}
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
