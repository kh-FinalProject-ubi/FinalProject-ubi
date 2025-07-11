import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import LikeButton from "../../components/welfareLike/LikeButton";

// 안전하게 값 추출하는 함수
const getValue = (node) => {
  if (!node) return "정보 없음";
  if (typeof node === "string") return node;
  if (typeof node === "object" && "text" in node) return node.text;
  return JSON.stringify(node);
};

const WelfareDetailPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryServId = searchParams.get("servId");
  const token = useAuthStore((state) => state.token);

  const stateData = location.state?.data;

  const rawId = stateData?.id || stateData?.servId || queryServId;
  const servId = rawId?.replace(/^bokjiro-/, ""); // bokjiro- 제거
  const source = stateData?.source;

  // 외부 API 호출 조건
  const isBokjiro =
    rawId?.startsWith("bokjiro-") || source === "bokjiro" || !!queryServId;

  // fallbackData
  const fallbackData = {
    id: `bokjiro-${servId}`,
    category: "기타",
    regionCity: "알 수 없음",
    regionDistrict: "알 수 없음",
    link: "",
  };

  const data = stateData || fallbackData;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("🛠 useEffect 시작");
    console.log("📦 data:", data);
    console.log("🧪 rawId:", rawId);
    console.log("🧪 parsed servId:", servId);
    console.log("🔍 isBokjiro:", isBokjiro);
    if (!servId) {
      console.warn("❗ servId 없음 - 요청 중단");
      return;
    }

    setLoading(true);

    if (isBokjiro) {
      // bokjiro 외부 API 호출
      axios
        .get(`/api/welfare-curl/welfare-detail?servId=${servId}`)
        .then((res) => {
          console.log("✅ 외부 API 응답:", res.data);
          setDetail(res.data.detail || null);
        })
        .catch((err) => {
          console.error("❌ 외부 API 상세 조회 실패:", err);
        })
        .finally(() => setLoading(false));
    } else {
      // DB 조회
      axios
        .get(`/api/welfare/detail?apiServiceId=${rawId}`)
        .then((res) => {
          console.log("✅ DB 응답:", res.data);
          setDetail(res.data.detail || null);
        })
        .catch((err) => {
          console.error("❌ DB 상세 조회 실패:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [servId]);

  if (loading) return <p>🔄 상세 정보를 불러오는 중입니다...</p>;
  if (!detail) return <p>❌ 복지 상세 정보를 불러오지 못했습니다.</p>;

  return (
    <div className="welfare-detail-page">
      <h2>{getValue(detail.servNm)}</h2>

      <p>
        <strong>카테고리:</strong> {data.category}
      </p>

      <LikeButton
        token={token}
        apiServiceId={data.id}
        serviceName={getValue(detail.servNm)}
        category={data.category}
        regionCity={data.regionCity}
        regionDistrict={data.regionDistrict}
        description={
          getValue(detail.servDgst) ||
          getValue(detail.alwServCn) ||
          getValue(detail.aplyMtdCn) ||
          "설명 없음"
        }
        agency={getValue(detail.bizChrDeptNm)}
        url={getValue(detail.servDtlLink) || data.link}
        receptionStart={getValue(detail.enfcBgngYmd)}
        receptionEnd={getValue(detail.enfcEndYmd)}
        imageProfile={null}
        lat={null}
        lng={null}
      />

      <p>
        <strong>제공 부서:</strong> {getValue(detail.bizChrDeptNm)}
      </p>
      <p>
        <strong>주소지:</strong> {getValue(detail.ctpvNm)}{" "}
        {getValue(detail.sggNm)}
      </p>
      <p>
        <strong>지원 주기:</strong> {getValue(detail.sprtCycNm)}
      </p>
      <p>
        <strong>지원 방식:</strong> {getValue(detail.srvPvsnNm)}
      </p>
      <p>
        <strong>지원 대상:</strong> {getValue(detail.sprtTrgtCn)}
      </p>
      <p>
        <strong>선정 기준:</strong> {getValue(detail.slctCritCn)}
      </p>
      <p>
        <strong>신청 방식:</strong> {getValue(detail.aplyMtdNm)}
      </p>
      <p>
        <strong>신청 방법:</strong> {getValue(detail.aplyMtdCn)}
      </p>
      <p>
        <strong>지원 내용:</strong> {getValue(detail.alwServCn)}
      </p>

      {/* 문의처 */}
      <p>
        <strong>문의처:</strong>
        <br />
        {Array.isArray(detail.inqplCtadrList)
          ? detail.inqplCtadrList.map((item, i) => (
              <span key={i}>
                📞 {getValue(item.wlfareInfoReldNm)}:{" "}
                {getValue(item.wlfareInfoReldCn)}
                <br />
              </span>
            ))
          : detail.inqplCtadrList && (
              <span>
                📞 {getValue(detail.inqplCtadrList.wlfareInfoReldNm)}:{" "}
                {getValue(detail.inqplCtadrList.wlfareInfoReldCn)}
              </span>
            )}
      </p>

      {/* 관련 법령 */}
      {detail.baslawList && (
        <p>
          <strong>관련 법령:</strong>
          <br />
          {Array.isArray(detail.baslawList)
            ? detail.baslawList.map((law, i) => (
                <span key={i}>
                  {getValue(law.wlfareInfoReldNm)}
                  <br />
                </span>
              ))
            : getValue(detail.baslawList.wlfareInfoReldNm)}
        </p>
      )}

      {/* 서식 파일 */}
      {detail.basfrmList && (
        <p>
          <strong>관련 서식:</strong>
          <br />
          {Array.isArray(detail.basfrmList) ? (
            detail.basfrmList.map((file, i) => (
              <span key={i}>
                📎{" "}
                <a
                  href={getValue(file.wlfareInfoReldCn)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {getValue(file.wlfareInfoReldNm)}
                </a>
                <br />
              </span>
            ))
          ) : (
            <a
              href={getValue(detail.basfrmList.wlfareInfoReldCn)}
              target="_blank"
              rel="noreferrer"
            >
              {getValue(detail.basfrmList.wlfareInfoReldNm)}
            </a>
          )}
        </p>
      )}
    </div>
  );
};

export default WelfareDetailPage;
