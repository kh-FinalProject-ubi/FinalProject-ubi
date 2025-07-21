// components/BenefitCard/BenefitCardRecruit.jsx
import styles from "../../styles/mypage/BenefitCard.module.css";

export default function BenefitCardRecruit({ benefit, onClick }) {
  return (
    <div
      className={styles.card}
      onClick={() => onClick?.(benefit)}
    >
      <div className={styles.badgeRow}>채용 정보</div>

      <div className={styles.title}>
        {benefit.jobTitle}
      </div>

      <div className={styles.desc}>
        {benefit.jobFacilityName}
      </div>

      <div className={styles.detail}>
        입금조건: {benefit.jobSalary}
      </div>

      <div className={styles.detail}>
        채용분야: {benefit.jobPosition}
      </div>

      <div className={styles.detail}>
        자격조건: {benefit.jobRequirement}
      </div>

      <div className={styles.detail}>
        내용: {benefit.jobContent}
      </div>

      <p className={styles.date}>
        {benefit.rcptbgndt && benefit.rcptenddt
          ? `${benefit.rcptbgndt} ~ ${benefit.rcptenddt}`
          : "상세 확인 필요"}
      </p>
    </div>
  );
}
