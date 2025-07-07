import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";

const safe = (val) => val || "정보 없음";

const WelfareDetailPage = () => {
  const location = useLocation();
  const data = location.state?.data;
  const token = useAuthStore((state) => state.token);

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const servId = data?.servId || data?.id?.replace("bokjiro-", "");

  useEffect(() => {
    if (!servId) return;

    setLoading(true);
    axios
      .get(`/api/welfare-curl/welfare-detail?servId=${servId}`)
      .then((res) => {
        const item = res.data.detail || null; // ✅ 수정
        setDetail(item);
        console.log("📦 복지 상세 데이터:", item);
      })
      .catch((err) => {
        console.error("❌ 복지 상세 조회 실패:", err);
      })
      .finally(() => setLoading(false));
  }, [servId]);

  if (loading) return <p>🔄 상세 정보를 불러오는 중입니다...</p>;
  if (!detail) return <p>❌ 복지 상세 정보를 불러오지 못했습니다.</p>;

  return (
    <div className="welfare-detail-page">
      <h2>{safe(detail.servNm)}</h2>

      <p>
        <strong>📂 카테고리:</strong> {safe(data?.category)}
      </p>

      {/* 찜하기 버튼 */}
      <LikeButton
        token={token}
        apiServiceId={data?.id || servId}
        serviceName={detail.servNm}
        category={data?.category}
        regionCity={data?.regionCity}
        regionDistrict={data?.regionDistrict}
        description={detail.servDgst || detail.alwServCn || "설명 없음"}
        agency={detail.bizChrDeptNm || "기관 정보 없음"}
        url={data?.link}
        receptionStart={null} // Bokjiro는 따로 없음
        receptionEnd={null}
        imageProfile={null}
        lat={null}
        lng={null}
      />

      <p>
        <strong>제공 부서:</strong> {safe(detail.bizChrDeptNm)}
      </p>
      <p>
        <strong>지원 주기:</strong> {safe(detail.sprtCycNm)}
      </p>
      <p>
        <strong>지원 내용:</strong> {safe(detail.alwServCn || detail.servDgst)}
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
        <strong>문의처:</strong>{" "}
        {Array.isArray(detail.inqplCtadrList)
          ? detail.inqplCtadrList.map((c, i) => (
              <span key={i}>{safe(c.wlfareInfoReldCn)} </span>
            ))
          : safe(detail.inqplCtadrList?.wlfareInfoReldCn)}
      </p>

      <p>
        <strong>제공 링크:</strong>{" "}
        <a href={data?.link} target="_blank" rel="noopener noreferrer">
          {data?.link}
        </a>
      </p>
    </div>
  );
};

export default WelfareDetailPage;
