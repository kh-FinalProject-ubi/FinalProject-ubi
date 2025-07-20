import { useLocation, useParams, useSearchParams } from "react-router-dom";
import BokjiroDetail from "./BokjiroDetail";
import GenericDetail from "./GenericDetail";
import WelfareReviewSection from "./ReviewSession";

const WelfareDetailPage = () => {
  const location = useLocation();
  const { servId: pathServId } = useParams();
  const [searchParams] = useSearchParams();

  const queryServId = searchParams.get("servId");
  const stateData = location.state?.data;

  const rawId = stateData?.id || stateData?.servId || pathServId || queryServId;
  const finalServId = rawId?.replace(/^bokjiro-/, ""); // bokjiro- prefix 제거

  // ✅ 판별 로직: bokjiro인지 여부
  const isBokjiro =
    stateData?.id?.startsWith("bokjiro-") ||
    (!!rawId && !rawId.startsWith("seoul-") && !rawId.startsWith("job-"));

  return (
    <>
      {isBokjiro ? (
        <BokjiroDetail servId={finalServId} data={stateData} />
      ) : (
        <GenericDetail data={stateData} />
      )}

      {/* ✅ WelfareReviewSection 레이아웃을 감싸는 wrapper */}
      <div
        style={{
          maxWidth: "870px",
          margin: "40px auto 0 auto",
          padding: "0 20px",
          boxSizing: "border-box",
        }}
      >
        <WelfareReviewSection apiServiceId={finalServId} />
      </div>
    </>
  );
};

export default WelfareDetailPage;
