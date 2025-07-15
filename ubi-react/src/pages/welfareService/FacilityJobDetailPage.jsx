import React, { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";
import styles from "../../styles/DetailCommon.module.css";

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
    <div className={styles.detailContainer}>
      <h2 className={styles.heading}>{safe(data.serviceName)}</h2>

      <p className={styles.paragraph}>
        <span className={styles.label}>📂 카테고리:</span>{" "}
        {safe(data.category || "복지 일자리")}
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

      <p className={styles.paragraph}>
        <span className={styles.label}>설명:</span> {safe(data.description)}
      </p>

      <p className={styles.paragraph}>
        <span className={styles.label}>📍 지역:</span>{" "}
        {`${safe(data.regionCity)} ${safe(data.regionDistrict)}`}
      </p>

      {data?.servicePay && (
        <p className={styles.paragraph}>
          <span className={styles.label}>💰 급여:</span> {data.servicePay}
        </p>
      )}
      {data?.agency && (
        <p className={styles.paragraph}>
          <span className={styles.label}>📞 제공 기관:</span> {data.agency}
        </p>
      )}
      {data?.url && (
        <p className={styles.paragraph}>
          <span className={styles.label}>🔗 링크:</span>{" "}
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            상세 페이지
          </a>
        </p>
      )}
    </div>
  );
};

export default FacilityJobDetailPage;
