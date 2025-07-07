import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";

import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const SeoulWelfareDetailPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const apiServiceId = searchParams.get("apiServiceId");
  const token = useAuthStore((state) => state.token);
  const safe = (val) => val || "정보 없음";

  const [data, setData] = useState(location.state?.data || null);

  useEffect(() => {
    if (!apiServiceId) return;

    fetch(`/api/welfare/detail?apiServiceId=${apiServiceId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.detail) setData(result.detail);
      })
      .catch(() => {
        setData(null);
      });
  }, [apiServiceId]);

  if (!data) return <p>❌ 데이터를 불러올 수 없습니다.</p>;

  return (
    <div className="welfare-detail-page">
      <h2>{safe(data.serviceName)}</h2>

      <p>
        <strong>📂 카테고리:</strong> {safe(data.category)}
      </p>

      <LikeButton
        apiServiceId={data.apiServiceId}
        serviceName={data.serviceName}
        category={data.category}
        regionCity="서울특별시"
        regionDistrict={data.regionDistrict}
        token={token}
      />

      <p>
        <strong>설명:</strong> {safe(data.description)}
      </p>

      <p>
        <strong>📍 지역:</strong> 서울특별시 {safe(data.regionDistrict)}
      </p>

      {data?.imageProfile && (
        <img
          src={data.imageProfile}
          alt="복지 이미지"
          style={{ maxWidth: "100%", borderRadius: "8px", margin: "20px 0" }}
        />
      )}

      {data?.url && (
        <p>
          <strong>제공 링크:</strong>{" "}
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            {data.url}
          </a>
        </p>
      )}
    </div>
  );
};

export default SeoulWelfareDetailPage;
