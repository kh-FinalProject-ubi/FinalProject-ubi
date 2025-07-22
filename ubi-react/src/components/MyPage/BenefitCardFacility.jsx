import React from "react";
import styles from "../../styles/mypage/BenefitCard.module.css";
import { stripHtml } from "../../pages/mypage/striptHtml";
import axios from "axios";

export default function BenefitCardFacility({
  benefit,
  onClick,
  onUnfav,
  token,
}) {
  const isEvent = !!benefit.eventTitle;

  // 이벤트 내용 요약
  const contentText = (() => {
    const plain = stripHtml(benefit.eventContent || "");
    if (!plain) return "내용 없음";
    return plain.length > 20 ? `${plain.slice(0, 20)}...` : plain;
  })();

  // 별(찜 해제) 버튼 클릭
  const toggleFavorite = async (e) => {
    e.stopPropagation(); // 카드 클릭 막기!
    if (!benefit.facilityNo) {
      alert("시설 번호가 없습니다!");
      return;
    }
    try {
      await axios.delete(`/api/myPage/favorite/facility`, {
        params: { facilityNo: benefit.facilityNo },
        headers: { Authorization: `Bearer ${token}` },
      });
      onUnfav?.(benefit.facilityNo); // 상위에서 카드 제거
    } catch (err) {
      console.error("찜 토글 실패", err);
      alert("찜 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div
      className={styles.card}
      onClick={() => onClick?.(benefit)}
      style={{ cursor: "pointer" }}
    >
      {/* 별(찜 해제) 버튼 */}
      <button
        className={`${styles.favoriteBtn} ${
          benefit.isFav ? styles.active : ""
        }`}
        onClick={toggleFavorite}
        style={{
          width: 15,
          height: 15,
          background: 'url("/Star.png") center/contain no-repeat',
        }}
        aria-label="찜 해제"
      />

      {/* 카드 내용 */}
      <div className={styles.badgeRow}>
        {isEvent ? "이벤트 정보" : "시설 이용"}
      </div>

      <div className={styles.title}>
        {isEvent ? benefit.eventTitle : benefit.facilityName}
      </div>

      <div className={styles.desc}>
        {isEvent ? contentText : benefit.facilityKindNM}
      </div>

      {!isEvent && (
        <div className={styles.detail}>입장 기준: {benefit.requirement}</div>
      )}

      <p className={styles.date}>
        {isEvent
          ? benefit.eventDateStart && benefit.eventDateEnd
            ? `${benefit.eventDateStart} ~ ${benefit.eventDateEnd}`
            : "상세 확인 필요"
          : benefit.rcptbgndt && benefit.rcptenddt
          ? `${benefit.rcptbgndt} ~ ${benefit.rcptenddt}`
          : "상세 확인 필요"}
      </p>
    </div>
  );
}
