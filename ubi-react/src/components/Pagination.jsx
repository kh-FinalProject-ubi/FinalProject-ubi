import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        style={{
          margin: "0 4px",
          padding: "4px 8px",
          backgroundColor: i === currentPage ? "#007bff" : "#fff",
          color: i === currentPage ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        {i}
      </button>
    );
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          style={{ marginRight: "8px" }}
        >
          ◀ 이전
        </button>
      )}
      {pages}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          style={{ marginLeft: "8px" }}
        >
          다음 ▶
        </button>
      )}
    </div>
  );
};

export default Pagination;
