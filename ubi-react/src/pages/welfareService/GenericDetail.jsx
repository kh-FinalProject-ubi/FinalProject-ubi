import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "./../../components/welfareLike/LikeButton";

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
    <div className="welfare-detail-page">
      <h2>{safe(data?.title)}</h2>
      <p>
        <strong>📂 카테고리:</strong> {safe(data?.category)}
      </p>
      <LikeButton
        apiServiceId={data?.id}
        serviceName={data?.title}
        category={data?.category}
        regionCity={data?.regionCity}
        regionDistrict={data?.regionDistrict}
        token={token}
      />
      <p>
        <strong>설명:</strong>
      </p>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {cleanText(data?.description)}
      </pre>
      {data?.imageUrl && (
        <img
          src={data.imageUrl}
          alt="복지 이미지"
          style={{ maxWidth: "100%", borderRadius: "8px", margin: "20px 0" }}
        />
      )}
      <p>
        <strong>📍 지역:</strong>{" "}
        {safe(`${data?.regionCity || ""} ${data?.regionDistrict || ""}`)}
      </p>
      {data?.link && (
        <p>
          <strong>제공 링크:</strong>{" "}
          <a href={data?.link} target="_blank" rel="noopener noreferrer">
            {data?.link}
          </a>
        </p>
      )}
    </div>
  );
};

export default GenericDetail;
