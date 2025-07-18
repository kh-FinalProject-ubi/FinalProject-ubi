import React from "react";
import styles from "../styles/common/Pagination.module.css";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pageGroupSize = 10;
  const startPage =
    Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
  const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className={styles.paginationContainer}>
      {/* "맨 처음" 버튼 */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={styles.button}
      >
        &laquo;
      </button>

      {/* "이전" 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={styles.button}
      >
        &lt;
      </button>

      {/* 숫자 버튼들 */}
      {pageNumbers.map((number) => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          // ✅ 공통 .button 클래스와, 활성화 시 .activePage 클래스를 함께 적용
          className={`${styles.button} ${
            currentPage === number ? styles.activePage : ""
          }`}
        >
          {number}
        </button>
      ))}

      {/* "다음" 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.button}
      >
        &gt;
      </button>

      {/* "맨 끝" 버튼 */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={styles.button}
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
