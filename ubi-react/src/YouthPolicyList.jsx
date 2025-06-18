import axios from "axios";
import { useEffect, useState } from "react";

function YouthPolicyList() {
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/welfare-curl/youth-policy", {
        params: {
          pageNum: 1,
          pageSize: 10,
        },
      })
      .then((res) => {
        console.log("받은 전체 응답:", res.data);
        setPolicies(res.data.result?.youthPolicyList || []);
      })
      .catch((err) => {
        console.error("청년정책 로딩 실패:", err);
        setError("정책을 불러오는 데 실패했습니다.");
      });
  }, []);

  return (
    <div>
      <h1>청년 정책 목록</h1>
      {error && <p>{error}</p>}
      <ul>
        {policies.map((policy) => (
          <li key={policy.plcyNo}>
            <strong>{policy.plcyNm}</strong> - {policy.plcyExplnCn}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default YouthPolicyList;
