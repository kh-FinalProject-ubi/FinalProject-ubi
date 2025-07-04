import { useLocation } from "react-router-dom";
import BokjiroDetail from "./BokjiroDetail";
import GenericDetail from "./GenericDetail";

const WelfareDetailPage = () => {
  const location = useLocation();
  const data = location.state?.data;

  const isBokjiro =
    data?.source === "bokjiro" || data?.id?.startsWith("bokjiro-");

  return isBokjiro ? (
    <BokjiroDetail data={data} />
  ) : (
    <GenericDetail data={data} />
  );
};

export default WelfareDetailPage;
