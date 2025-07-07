import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";

const safe = (val) => val || "정보 없음";

const FacilityJobDetailPage = () => {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);

  const [data, setData] = useState(location.state?.data || null);
  const apiServiceId = location.state?.data?.id;

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
      <h2>{safe(data.jobTitle)}</h2>
      <p>
        <strong>📂 카테고리:</strong> {safe(data.category || "복지 일자리")}
      </p>
      <LikeButton
        token={token}
        apiServiceId={data?.id}
        serviceName={data?.jobTitle}
        category={data?.category}
        regionCity={data?.regionCity}
        regionDistrict={data?.regionDistrict}
        description={data?.jobRequirement || "설명 없음"}
        agency={data?.jobAgency || "기관 정보 없음"}
        url={data?.link}
        receptionStart={null}
        receptionEnd={null}
        imageProfile={null}
        lat={null}
        lng={null}
      />
      <p>
        <strong>설명:</strong> {safe(data.jobRequirement)}
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
      {data?.jobContact && (
        <p>
          <strong>📞 연락처:</strong> {safe(data.jobContact)} (
          {safe(data.jobContactTel)})
        </p>
      )}
      {data?.jobAddress && (
        <p>
          <strong>🏠 주소:</strong> {data.jobAddress}
        </p>
      )}
    </div>
  );
};

export default FacilityJobDetailPage;
