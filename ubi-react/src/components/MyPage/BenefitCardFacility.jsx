// components/BenefitCard/BenefitCardFacility.jsx
import styles from "../../styles/mypage/BenefitCard.module.css";
import { stripHtml } from "../../pages/mypage/striptHtml";

export default function BenefitCardFacility({ benefit, onClick }) {
  const isEvent = !!benefit.eventTitle;

  const contentText = (() => {
    const plain = stripHtml(benefit.eventContent || "");
    if (!plain) return "내용 없음";
    return plain.length > 20 ? `${plain.slice(0, 20)}...` : plain;
  })();

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    try {
        await axios.delete(`/api/myPage/favorite`, {
          params : { serviceNo : benefit.serviceNo },
          headers: { Authorization: `Bearer ${token}` },
        });
        onUnfav?.(benefit.serviceNo);       // 목록에서 제거
    } catch (err) {
      console.error("찜 토글 실패", err);
      alert("찜 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.card} onClick={() => onClick?.(benefit)}>
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
        <div className={styles.detail}>
          입장 기준: {benefit.requirement}
        </div>
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
