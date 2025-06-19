import axios from "axios";
import React, { useEffect, useState } from "react";
import Pagination from "../components/Pagination"; // 경로는 실제 위치에 맞게

function YouthPolicyList() {
  const [policies, setPolicies] = useState([]);
  const [error, setError] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    axios
      .get("http://localhost:80/api/welfare-curl/youth-policy", {
        params: { pageNum, pageSize },
      })
      .then((res) => {
        console.log("받은 응답:", res.data);
        setPolicies(res.data.result?.youthPolicyList || []);
        setTotalCount(res.data.result?.totalCount || 0);
      })
      .catch((err) => {
        console.error("청년정책 로딩 실패:", err);
        setError("정책을 불러오는 데 실패했습니다.");
      });
  }, [pageNum]);

  const totalPages = Math.ceil(totalCount / pageSize);

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
      <Pagination
        currentPage={pageNum}
        totalPages={totalPages}
        onPageChange={(num) => setPageNum(num)}
      />
    </div>
  );
}

export default YouthPolicyList;
