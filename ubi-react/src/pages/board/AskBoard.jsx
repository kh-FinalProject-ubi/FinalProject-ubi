import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import Pagination from "../../components/Pagination";

const boardCodeMap = {
  "/noticeBoard": 1,
  "/askBoard": 2,
};

const authorityMap = {
  1: "USER",
  2: "ADMIN",
};

const AskBoard = () => {
  const [boardList, setBoardList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const { token, authority, memberNo: loginMemberNo } = useAuthStore();

  const path = location.pathname;
  const boardCode = boardCodeMap[path];

  // authority 값이 있을 때만 isAdmin, isUser를 계산
  const isAdmin = authority && authorityMap[authority] === "ADMIN";
  const isUser = authority && authorityMap[authority] === "USER";

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    if (!boardCode) return;

    axios;
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

  if (!boardCode) return <p>존재하지 않는 게시판입니다.</p>;
  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>문의게시판</h2>
      <table style={{ width: "100%", textAlign: "center" }}>
        <thead>
          <tr>
            <th>번호</th>
            <th>분류</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>답변상태</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {boardList.map((board, index) => (
            <tr key={board.boardNo}>
              <td>{index + 1 + (currentPage - 1) * 10}</td>
              <td>{board.postType}</td>
              <td>
                <Link to={`${path}/${board.boardNo}`}>
                  <strong>{board.boardTitle}</strong>
                </Link>
              </td>
              <td>{board.memberNickname}</td>
              <td>{board.boardDate}</td>
              <td>{board.boardAnswer}</td>
              <td>{board.boardReadCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.maxPage}
          onPageChange={handlePageChange}
        />
      )}

      {(isAdmin || isUser) && (
        <button
          onClick={() => navigate(`${path}/write`)}
          style={{ marginTop: "1rem", float: "right" }}
        >
          글 작성
        </button>
      )}
    </div>
  );
};

export default AskBoard;
