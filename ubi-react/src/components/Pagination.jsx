import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];

  const pageGroupSize = 10;
  const startPage =
    Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        style={{
          margin: "0 4px",
          padding: "2px 8px",
          backgroundColor: i === currentPage ? "#007bff" : "#fff",
          color: i === currentPage ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "14px", // 숫자 크기
          cursor: "pointer",
        }}
      >
        {i}
      </button>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {/* 맨 처음 */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(1)}
          style={{
            marginRight: "5px",
            padding: "1px 6px",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
          }}
        >
          맨 처음
        </button>
      )}

      {/* ◀◀ 10페이지 이전 */}
      {startPage > 1 && (
        <button
          onClick={() => onPageChange(startPage - 1)}
          style={{
            marginRight: "5px",
            padding: "1px 6px",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
          }}
        >
          ◀◀
        </button>
      )}

      {/* ◀ 이전 */}
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            marginRight: "5px",
            padding: "1px 6px",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
          }}
        >
          ◀ 이전
        </button>
      )}

      {/* 숫자 버튼 */}
      {pages}

      {/* 다음 ▶ */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            marginLeft: "5px",
            padding: "1px 6px",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
          }}
        >
          다음 ▶
        </button>
      )}

      {/* ▶▶ 10페이지 이후 */}
      {endPage < totalPages && (
        <button
          onClick={() => onPageChange(endPage + 1)}
          style={{
            marginLeft: "5px",
            padding: "1px 6px",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
          }}
        >
          ▶▶
        </button>
      )}

      {/* 맨 끝 */}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(totalPages)}
          style={{
            marginLeft: "5px",
            padding: "1px 6px",
            fontSize: "12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "#f8f9fa",
            cursor: "pointer",
          }}
        >
          맨 끝
        </button>
      )}
    </div>
  );
};

export default Pagination;
