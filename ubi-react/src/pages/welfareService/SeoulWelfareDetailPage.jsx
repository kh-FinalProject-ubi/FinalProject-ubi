import React from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";

const safe = (val) => val || "정보 없음";

const SeoulWelfareDetailPage = () => {
  const location = useLocation();
  const data = location.state?.data;
  const token = useAuthStore((state) => state.token);

  if (!data) return <p>❌ 데이터를 불러올 수 없습니다.</p>;

  return (
    <div className="welfare-detail-page">
      <h2>{safe(data.title)}</h2>

      <p>
        <strong>📂 카테고리:</strong> {safe(data.category)}
      </p>

      <LikeButton
        apiServiceId={data.id}
        serviceName={data.title}
        category={data.category}
        regionCity={data.regionCity}
        regionDistrict={data.regionDistrict}
        token={token}
      />

      <p>
        <strong>설명:</strong> {safe(data.description)}
      </p>

      <p>
        <strong>📍 지역:</strong>{" "}
        {`${safe(data.regionCity)} ${safe(data.regionDistrict)}`}
      </p>

      {data?.imageUrl && (
        <img
          src={data.imageUrl}
          alt="복지 이미지"
          style={{ maxWidth: "100%", borderRadius: "8px", margin: "20px 0" }}
        />
      )}

      {data?.link && (
        <p>
          <strong>제공 링크:</strong>{" "}
          <a href={data.link} target="_blank" rel="noopener noreferrer">
            {data.link}
          </a>
        </p>
      )}
    </div>
  );
};

export default SeoulWelfareDetailPage;
