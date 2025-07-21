import BenefitCardGeneral from "./BenefitCardGeneral";
import BenefitCardRecruit from "./BenefitCardRecruit";
import BenefitCardFacility from "./BenefitCardFacility";

export default function BenefitCardWrapper({ category, benefit, ...props }) {
  switch (category) {
    case "혜택":
      return <BenefitCardGeneral benefit={benefit} {...props} />;
    case "시설":
      return <BenefitCardFacility benefit={benefit} {...props} />;
    default:
      return null;
  }
}
