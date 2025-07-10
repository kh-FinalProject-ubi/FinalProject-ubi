import { useLocation, useParams, useSearchParams } from "react-router-dom";
import BokjiroDetail from "./BokjiroDetail";
import GenericDetail from "./GenericDetail";

const WelfareDetailPage = () => {
  const location = useLocation();
  const { servId: pathServId } = useParams();
  const [searchParams] = useSearchParams();

  const queryServId = searchParams.get("servId");
  const data = location.state?.data;

  // ✅ 최종 servId: param → query 순으로 fallback
  const finalServId = pathServId || queryServId;

  // ✅ 분기 조건: data가 있으면 복지로 여부 우선 판단
  const isBokjiro =
    !!data ||
    !!finalServId ||
    data?.source === "bokjiro" ||
    data?.id?.startsWith("bokjiro-");

  return isBokjiro ? (
    <BokjiroDetail servId={finalServId} data={data} />
  ) : (
    <GenericDetail data={data} />
  );
};

export default WelfareDetailPage;
