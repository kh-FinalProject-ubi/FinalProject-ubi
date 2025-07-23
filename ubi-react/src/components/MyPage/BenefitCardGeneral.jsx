import axios from "axios";
import styles from "../../styles/mypage/BenefitCard.module.css";
import { stripHtml } from "../../pages/mypage/striptHtml";

export default function BenefitCard({ benefit, token, onUnfav, onClick }) {
  /* ⭐ 즐겨찾기 토글 */
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

  /* 줄임표용 헬퍼 */
  const ellipsis = (txt, len) =>
    txt && txt.length > len ? `${txt.slice(0, len)}...` : txt || "";

  return (
    <div className={styles.card} onClick={() => onClick?.(benefit)}>
      {/* 별 버튼 */}
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
      >
      </button>

      {/* 태그 영역 */}
      <div className={styles.cardHeader}>
        <div className={styles.tagGroup}>
          {/* <span className={`${styles.tag} ${styles.tagMain}`}>일반</span>
          <span className={`${styles.tag} ${styles.tagType}`}>보조금</span>
          {benefit.receptionStart && (
            <span className={`${styles.tag} ${styles.tagApply}`}>신청 혜택</span>
          )} */}
        </div>
      </div>

      {/* 본문 */}
      <div className={styles.title}>
        {ellipsis(stripHtml(benefit.serviceName), 10)}
      </div>

      <div className={styles.desc}>
        {ellipsis(stripHtml(benefit.description), 40)}
      </div>

      <p className={styles.date}>
        {benefit.receptionStart && benefit.receptionEnd
          ? `${benefit.receptionStart} ~ ${benefit.receptionEnd}`
          : "상세 확인 필요"}
      </p>
    </div>
  );
}
