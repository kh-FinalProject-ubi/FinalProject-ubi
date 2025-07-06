import React from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";

const safe = (val) => val || "정보 없음";

const FacilityJobDetailPage = () => {
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

      {data?.jobSalary && (
        <p>
          <strong>💰 급여:</strong> {data.jobSalary}
        </p>
      )}

      {data?.jobExperience && (
        <p>
          <strong>📌 경력/학력:</strong> {data.jobExperience}
        </p>
      )}

      {data?.contact && (
        <p>
          <strong>📞 연락처:</strong> {data.contact}
        </p>
      )}

      {data?.address && (
        <p>
          <strong>🏠 주소:</strong> {data.address}
        </p>
      )}
    </div>
  );
};

export default FacilityJobDetailPage;
