import React, { useEffect, useState } from "react";
import axios from "axios";

function KidFacilityList() {
  const [facilities, setFacilities] = useState([]); // 누적된 전체 데이터
  const [filteredFacilities, setFilteredFacilities] = useState([]); // 필터링 결과
  const [inputAddress, setInputAddress] = useState(""); // 입력창 상태
  const [page, setPage] = useState(1); // 현재 페이지
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터 여부
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 데이터 호출 함수
  const fetchFacilities = async (pageNum) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:80/kid/facility", {
        params: {
          lon: 126.9784,
          lat: 37.5666,
          buffer: 50000,
          page: pageNum,
          size: 1000,
        },
      });

      const data = res.data;
      const newFeatures =
        data?.response?.result?.featureCollection?.features || [];

      setFacilities((prev) => [...prev, ...newFeatures]);
      setHasMore(newFeatures.length === 1000); // 1000개 미만이면 마지막 페이지
    } catch (err) {
      setError("데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 첫 페이지 로드
  useEffect(() => {
    fetchFacilities(1);
  }, []);

  // 주소 필터링 적용
  useEffect(() => {
    const filterStr = inputAddress.trim().toLowerCase();

    if (filterStr === "") {
      setFilteredFacilities(facilities);
    } else {
      setFilteredFacilities(
        facilities.filter((feature) => {
          const fac = feature.properties || {};
          const addr1 = fac.fac_n_add?.toLowerCase() || "";
          const addr2 = fac.fac_o_add?.toLowerCase() || "";
          return addr1.includes(filterStr) || addr2.includes(filterStr);
        })
      );
    }
  }, [inputAddress, facilities]);

  const handleFilterChange = (e) => {
    setInputAddress(e.target.value);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFacilities(nextPage);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>아동복지시설 목록</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form style={{ marginBottom: 20 }}>
        <label>
          주소 필터:&nbsp;
          <input
            type="text"
            value={inputAddress}
            onChange={handleFilterChange}
            placeholder="예: 서울"
            style={{ padding: 4 }}
          />
        </label>
      </form>

      <ul>
        {filteredFacilities.length === 0 ? (
          <li>조회된 데이터가 없습니다.</li>
        ) : (
          filteredFacilities.map((feature, idx) => {
            const fac = feature.properties || {};
            return (
              <li
                key={idx}
                style={{
                  marginBottom: 12,
                  borderBottom: "1px solid #ccc",
                  paddingBottom: 8,
                }}
              >
                <strong>{fac.fac_nam || "시설명 없음"}</strong> (
                {fac.cat_nam || "분류 없음"})
                <br />
                전화: {fac.fac_tel || "정보 없음"}
                <br />
                주소: {fac.fac_n_add || fac.fac_o_add || "주소 없음"}
                <br />
                읍면동코드: {fac.emdCd || "없음"}
              </li>
            );
          })
        )}
      </ul>

      {hasMore && !loading && (
        <button onClick={loadMore} style={{ marginTop: 20 }}>
          더 보기
        </button>
      )}
      {loading && <p>불러오는 중...</p>}
    </div>
  );
}

export default KidFacilityList;
