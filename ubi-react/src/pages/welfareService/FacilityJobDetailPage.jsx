import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";

const safe = (val) => val || "정보 없음";

const FacilityJobDetailPage = () => {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);

  const [data, setData] = useState(location.state?.data || null);
  const [searchParams] = useSearchParams();
  const rawServId = searchParams.get("servId");
  const apiServiceId = rawServId
    ? `job-API2-${rawServId}`
    : location.state?.data?.apiServiceId;

  useEffect(() => {
    if (!apiServiceId) return;
    fetch(`/api/welfare/detail?apiServiceId=${apiServiceId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.detail) setData(result.detail);
      })
      .catch(() => setData(null));
  }, [apiServiceId]);

  if (!data) return <p>❌ 데이터를 불러올 수 없습니다.</p>;

  return (
    <div className="welfare-detail-page">
      <h2>{safe(data.serviceName)}</h2>
      <p>
        <strong>📂 카테고리:</strong> {safe(data.category || "복지 일자리")}
      </p>

      <LikeButton
        token={token}
        apiServiceId={data?.apiServiceId}
        serviceName={data?.serviceName}
        category={data?.category}
        regionCity={data?.regionCity}
        regionDistrict={data?.regionDistrict}
        description={data?.description}
        agency={data?.agency}
        url={data?.url}
        receptionStart={data?.receptionStart}
        receptionEnd={data?.receptionEnd}
        imageProfile={null}
        lat={data?.lat}
        lng={data?.lng}
      />

      <p>
        <strong>설명:</strong> {safe(data.description)}
      </p>
      <p>
        <strong>📍 지역:</strong>{" "}
        {`${safe(data.regionCity)} ${safe(data.regionDistrict)}`}
      </p>

      {/* 선택적으로 급여, 연락처, 주소 표시 */}
      {data?.servicePay && (
        <p>
          <strong>💰 급여:</strong> {data.servicePay}
        </p>
      )}
      {data?.agency && (
        <p>
          <strong>📞 제공 기관:</strong> {data.agency}
        </p>
      )}
      {data?.url && (
        <p>
          <strong>🔗 링크:</strong>{" "}
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            상세 페이지
          </a>
        </p>
      )}
    </div>
  );
};

export default FacilityJobDetailPage;
