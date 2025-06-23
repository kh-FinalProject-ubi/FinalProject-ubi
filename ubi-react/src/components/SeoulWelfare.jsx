import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/SeoulWelfare.css";

// HTML 디코딩
const decodeHTML = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const extractTextFromHwpJson = (raw) => {
  try {
    const decodedHtml = decodeHTML(raw);
    const match = decodedHtml.match(/<!--\[data-hwpjson\]({[\s\S]*?})-->/);
    if (!match) return decodedHtml;

    const hwpJson = JSON.parse(match[1]);
    const result = [];

    if (hwpJson.ru && Array.isArray(hwpJson.ru)) {
      hwpJson.ru.forEach((block) => {
        if (block.ch && Array.isArray(block.ch)) {
          block.ch.forEach((chunk) => {
            if (chunk.t && chunk.t.trim()) {
              result.push(chunk.t.trim());
            }
          });
        }
      });
    }

    return result.join("\n");
  } catch (e) {
    console.error(e);
    return "상세내용 파싱 불가";
  }
};

const SeoulWelfare = () => {
  const [services, setServices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    axios
      .get("http://localhost:80/api/services")
      .then((response) => setServices(response.data))
      .catch((error) => console.error("데이터 불러오기 실패:", error));
  }, []);

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const currentItems = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">지자체 혜택</h2>
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        id="box"
      >
        {currentItems.map((item) => (
          <div
            key={item.apiServiceId}
            className="bg-white p-4 rounded-2xl shadow-md flex flex-col justify-between"
          >
            <div className="flex gap-2 mb-2">
              <span className="badge badge-yellow">일반</span>
              <span className="badge badge-blue">보조금</span>
              <span className="badge badge-gray">신청 혜택</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">
              {decodeHTML(item.SVCNM)}
            </h3>
            <p className="text-sm text-gray-700 font-medium">
              {decodeHTML(item.PLACENM || "혜택 제공 기관명")}
            </p>
            <p>{decodeHTML(item.USETGTINFO)}</p>

            {/* 내용 + 이미지 수평 배치 */}
            <div className="flex justify-between items-start mt-2">
              <p className="content line-clamp" id="content">
                {(() => {
                  const text = extractTextFromHwpJson(item.DTLCONT);
                  const maxLength = 100;
                  return text.length > maxLength
                    ? text.slice(0, maxLength) + "..."
                    : text;
                })()}
              </p>

              <div id="image" className="ml-4">
                <img
                  src={decodeHTML(item.IMGURL)}
                  alt="서비스 이미지"
                  className="w-20 h-20 object-cover rounded"
                />
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {decodeHTML(item.RCPTBGNDT)} ~ {decodeHTML(item.RCPTENDDT)}
            </p>

            <p className="p-2 border">
              <a
                href={decodeHTML(item.SVCURL)}
                target="_blank"
                rel="noopener noreferrer"
              >
                바로가기
              </a>
            </p>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="pagination-container">
        {/* 처음 페이지 */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(1)}
          className="pagination-btn"
        >
          &laquo;
        </button>

        {/* 이전 페이지 */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="pagination-btn"
        >
          &lt;
        </button>

        {/* 최대 10개의 페이지 버튼 */}
        {[...Array(Math.min(10, totalPages))].map((_, index) => {
          const startPage = Math.floor((currentPage - 1) / 10) * 10 + 1;
          const page = startPage + index;
          if (page > totalPages) return null;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`pagination-btn ${
                currentPage === page ? "active" : ""
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* 다음 페이지 */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="pagination-btn"
        >
          &gt;
        </button>

        {/* 마지막 페이지 */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="pagination-btn"
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

export default SeoulWelfare;
