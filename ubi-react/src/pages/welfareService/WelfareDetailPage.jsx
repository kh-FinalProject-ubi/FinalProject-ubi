import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
// import "../styles/WelfareDetailPage.css";
import LikeButton from "./../../components/welfareLike/LikeButton";

const safe = (val) => val || "정보 없음";

// 텍스트 전처리
function cleanText(text) {
  return String(text || "")
    .replace(/<\/?[^>]+(>|$)/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const WelfareDetailPage = () => {
  const location = useLocation();
  const data = location.state?.data;
  const token = useAuthStore((state) => state.token);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Bokjiro인 경우만 상세 API 요청
  const servId =
    data?.servId ||
    (data?.id?.startsWith("bokjiro-") ? data.id.replace("bokjiro-", "") : null);

  useEffect(() => {
    if (!servId) return;

    setLoading(true);
    axios
      .get(`/welfare-detail?servId=${servId}`)
      .then((res) => {
        const detailNode = res.data.detail?.response?.body?.items?.item;
        setDetail(detailNode);
        console.log("🔍 넘어온 data:", data);
        console.log("🎯 추출된 servId:", servId);
      })

      .catch((err) => {
        console.error("❌ 상세정보 로딩 실패", err);
      })
      .finally(() => setLoading(false));
  }, [servId]);

  const isDetailed = detail != null;

  return (
    <div className="welfare-detail-page">
      <h2>{safe(detail?.servNm || data?.title || data?.serviceName)}</h2>
      <p>
        <strong>📂 카테고리:</strong> {safe(data?.category)}
      </p>

      {/* ✅ 찜하기 버튼 */}
      <LikeButton
        apiServiceId={data?.id || servId || data?.apiServiceId}
        serviceName={data?.title || detail?.servNm}
        category={data?.category}
        regionCity={data?.regionCity}
        regionDistrict={data?.regionDistrict}
        token={token}
      />

      {loading && <p>🔄 상세 정보를 불러오는 중입니다...</p>}

      {!loading && isDetailed ? (
        <>
          <p>
            <strong>제공 부서:</strong> {safe(detail.bizChrDeptNm)}
          </p>
          <p>
            <strong>지원 주기:</strong> {safe(detail.sprtCycNm)}
          </p>
          <p>
            <strong>지원 내용:</strong>{" "}
            {safe(detail.alwServCn || detail.servDgst)}
          </p>
          <p>
            <strong>신청 방법:</strong> {safe(detail.aplyMtdCn)}
          </p>
          <p>
            <strong>지원 대상:</strong> {safe(detail.sprtTrgtCn)}
          </p>
          <p>
            <strong>선정 기준:</strong> {safe(detail.slctCritCn)}
          </p>
          <p>
            <strong>문의처:</strong>
          </p>
          {Array.isArray(detail.inqplCtadrList?.inqplCtadr) ? (
            detail.inqplCtadrList.inqplCtadr.map((item, i) => (
              <p key={i}>{safe(item.wlfareInfoReldCn)}</p>
            ))
          ) : (
            <p>{safe(detail.inqplCtadrList?.inqplCtadr?.wlfareInfoReldCn)}</p>
          )}
        </>
      ) : (
        <>
          <p>
            <strong>설명:</strong>
          </p>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {cleanText(data?.description)}
          </pre>
          {data?.imageUrl && (
            <div style={{ margin: "20px 0" }}>
              <img
                src={data.imageUrl}
                alt="복지 이미지"
                style={{ maxWidth: "100%", borderRadius: "8px" }}
              />
            </div>
          )}
          <p>
            <strong>📍 지역:</strong>{" "}
            {safe(`${data?.regionCity || ""} ${data?.regionDistrict || ""}`)}
          </p>
        </>
      )}
    </div>
  );
};

export default WelfareDetailPage;
