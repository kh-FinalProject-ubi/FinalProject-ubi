import { useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";
import styles from "../../styles/DetailCommon.module.css";
import GenericDetail from "./GenericDetail"; // ✅ 추가

const safe = (val) => val || "정보 없음";

const cleanText = (text) =>
  String(text || "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const SeoulWelfareDetailPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const apiServiceId = searchParams.get("apiServiceId");
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState(location.state?.data || null);

  useEffect(() => {
    if (!apiServiceId) return;

    // ✅ 1차: DB에서 상세 정보 조회
    fetch(`/api/welfare/detail?apiServiceId=${apiServiceId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.detail) {
          setData(result.detail);
        } else {
          // ✅ 2차: 서울시 원본 API에서 직접 조회
          fetch(`/api/seoul-welfare/detail?apiServiceId=${apiServiceId}`)
            .then((res) => res.json())
            .then((result) => {
              if (result.detail) setData(result.detail);
              else setData(null);
            })
            .catch(() => setData(null));
        }
      })
      .catch(() => setData(null));
  }, [apiServiceId]);

  if (!data) return <p>❌ 데이터를 불러올 수 없습니다.</p>;

  // ✅ GenericDetail로 이동해야 하는 경우 (데이터가 단순한 경우)
  if (!data.serviceName && data.title) {
    return <GenericDetail data={data} />;
  }

  return (
    <div className={styles.detailContainer}>
      <h2 className={styles.heading}>{safe(data.serviceName)}</h2>

      <p className={styles.paragraph}>
        <span className={styles.label}>📂 카테고리:</span> {safe(data.category)}
      </p>

      <LikeButton
        token={token}
        apiServiceId={data.apiServiceId}
        serviceName={data.serviceName}
        category={data.category || "기타"}
        regionCity="서울특별시"
        regionDistrict={data.regionDistrict}
        description={data.description || "설명 없음"}
        agency="서울시 복지"
        url={data.url || null}
        receptionStart={null}
        receptionEnd={null}
        imageProfile={data.imageProfile || null}
        lat={null}
        lng={null}
      />

      <p className={styles.paragraph}>
        <span className={styles.label}>설명:</span>
      </p>

      <pre className={styles.codeBlock}>{cleanText(data.description)}</pre>

      <p className={styles.paragraph}>
        <span className={styles.label}>📍 지역:</span> 서울특별시{" "}
        {safe(data.regionDistrict)}
      </p>

      {data?.imageProfile && (
        <img
          src={data.imageProfile}
          alt="복지 이미지"
          className={styles.image}
        />
      )}

      {data?.url && (
        <p className={styles.paragraph}>
          <span className={styles.label}>제공 링크:</span>{" "}
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            {data.url}
          </a>
        </p>
      )}
    </div>
  );
};

export default SeoulWelfareDetailPage;
