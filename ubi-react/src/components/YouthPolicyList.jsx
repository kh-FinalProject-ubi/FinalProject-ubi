import axios from "axios";
import React, { useEffect, useState } from "react";
import Pagination from "../components/Pagination";

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
    <div className="benefit-card">
      <h3 className="youth-title">청년 정책 목록</h3>
      {error && <p className="error-message">{error}</p>}

      <ul className="policy-list">
        {policies.map((policy) => (
          <li key={policy.plcyNo} className="policy-item">
            <strong className="policy-title">{policy.plcyNm}</strong>
            <p className="policy-desc">{policy.plcyExplnCn}</p>
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
