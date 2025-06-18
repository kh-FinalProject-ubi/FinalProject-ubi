import WelfareMap from "./welfaremap";
import PublicDataMap from "./PublicDataMap";
import YouthPolicyList from "./YouthPolicyList";

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
    </>
  );
}

export default App;
