import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/board/NoticeBoard.module.css";
import { stripHtml } from "../mypage/striptHtml";

const boardCodeMap = {
  "/noticeBoard": 1,
  "/askBoard": 2,
};

const NoticeBoard = () => {
  const [boardList, setBoardList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const { token, role, authority } = useAuthStore();
  const path = location.pathname;
  const boardCode = boardCodeMap[path];
  const isAdmin = authority === "2";

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!boardCode) return;
    setLoading(true);
    axios
      .get(`/api/board/${boardCode}`, {
        params: { cp: currentPage },
      })
      .then((res) => {
        setBoardList(res.data.boardList);
        setPagination(res.data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        console.error("게시판 목록 조회 실패:", err);
        alert("게시판을 불러오는 데 실패했습니다.");
        navigate("/");
      });
  }, [boardCode, navigate, currentPage]);

  const pageNumbers = [];
  if (pagination) {
    const pageGroupSize = 10;
    const currentGroup = Math.floor((currentPage - 1) / pageGroupSize);
    const startPage = currentGroup * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, pagination.maxPage);

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
  }

  if (!boardCode) return <p>존재하지 않는 게시판입니다.</p>;
  if (loading)
    return (
      <div className={styles.container}>
        <p>로딩 중...</p>
      </div>
    );

  return (
    <div className={styles.container}>
      <h2 className={styles.boardTitle}>공지게시판</h2>

      <table className={styles.boardTable}>
        <thead>
          <tr>
            <th>번호</th>
            <th>분류</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>좋아요</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {boardList.map((board, index) => (
            <tr
              key={board.boardNo}
              className={styles.clickableRow}
              onClick={() => navigate(`${path}/${board.boardNo}`)}
            >
              <td>{index + 1 + (currentPage - 1) * pagination.limit}</td>
              <td>
                <span className={styles.postTypeTag}>{board.postType}</span>
              </td>

              <td className={styles.titleCell}>
                {(() => {
                  const boardTitle = stripHtml(board.boardTitle);

                  if (!boardTitle) return "내용 없음";

                  return boardTitle.length > 20
                    ? `${boardTitle.slice(0, 20)}...`
                    : boardTitle;
                })()}
              </td>
              <td>{board.memberNickname}</td>
              <td>{board.boardDate}</td>
              <td>{board.likeCount}</td>
              <td>{board.boardReadCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.bottomContainer}>
        {token && isAdmin && (
          <button
            className={styles.writeButton}
            onClick={() => navigate(`${path}/write`)}
          >
            글쓰기
          </button>
        )}
      </div>

      <div className={styles.paginationContainer}>
        {pagination && pagination.maxPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              &lt;&lt;
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={
                  currentPage === number ? styles.activePage : styles.pageNumber
                }
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.maxPage}
            >
              &gt;
            </button>
            <button
              onClick={() => handlePageChange(pagination.maxPage)}
              disabled={currentPage === pagination.maxPage}
            >
              &gt;&gt;
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;
