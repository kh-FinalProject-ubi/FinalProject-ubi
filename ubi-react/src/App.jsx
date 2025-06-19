import WelfareMap from "./welfaremap";
import PublicDataMap from "./PublicDataMap";
import YouthPolicyList from "./YouthPolicyList";
import WelfareFacilityJobList from "./components/WelfareFacilityJobList";

function App() {
  return (
    <>
      <div>
        <h1>복지 서비스 지도</h1>
        <WelfareMap />
      </div>
      <div>
        <PublicDataMap />
      </div>
      <div>
        <YouthPolicyList />
      </div>
        <div>
      <WelfareFacilityJobList/>
    </div>
    </>
  );
}

export default App;
