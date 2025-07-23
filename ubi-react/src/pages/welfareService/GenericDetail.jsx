import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";
import styles from "../../styles/DetailCommon.module.css";
import WelfareReviewSection from "./ReviewSession";

const safe = (val) => val || "정보 없음";

const cleanText = (text) =>
  String(text || "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const GenericDetail = ({ data }) => {
  const token = useAuthStore((state) => state.token);

  return (
    <div className={styles.detailContainer}>
      <h2 className={styles.heading}>{safe(data?.title)}</h2>

      <p className={styles.paragraph}>
        <span className={styles.label}>📂 카테고리:</span>{" "}
        {safe(data?.category)}
      </p>

      <LikeButton
        apiServiceId={data?.id}
        serviceName={data?.title}
        category={data?.category}
        regionCity={data?.regionCity}
        regionDistrict={data?.regionDistrict}
        token={token}
      />

      <p className={styles.paragraph}>
        <span className={styles.label}>설명:</span>
      </p>

      <pre className={styles.codeBlock}>{cleanText(data?.description)}</pre>

      {data?.imageUrl && (
        <img src={data.imageUrl} alt="복지 이미지" className={styles.image} />
      )}

      <p className={styles.paragraph}>
        <span className={styles.label}>📍 지역:</span>{" "}
        {safe(`${data?.regionCity || ""} ${data?.regionDistrict || ""}`)}
      </p>

      {data?.link && (
        <p className={styles.paragraph}>
          <span className={styles.label}>제공 링크:</span>{" "}
          <a href={data?.link} target="_blank" rel="noopener noreferrer">
            {data?.link}
          </a>
        </p>
      )}
    </div>
  );
};

export default GenericDetail;
