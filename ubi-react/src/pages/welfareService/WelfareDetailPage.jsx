import { useLocation, useParams } from "react-router-dom";
import BokjiroDetail from "./BokjiroDetail";
import GenericDetail from "./GenericDetail";

const WelfareDetailPage = () => {
  const location = useLocation();
  const { servId } = useParams();
  const data = location.state?.data;

  const isBokjiro =
    !!servId || data?.source === "bokjiro" || data?.id?.startsWith("bokjiro-");

  return isBokjiro ? (
    <BokjiroDetail servId={servId} data={data} />
  ) : (
    <GenericDetail data={data} />
  );
};

export default WelfareDetailPage;
