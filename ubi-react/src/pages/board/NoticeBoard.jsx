import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";

const boardCodeMap = {
  "/noticeBoard": 1,
  "/askBoard": 2,
  // 필요한 만큼 매핑 추가
};

const NoticeBoard = () => {
  const [boardList, setBoardList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, authority, memberNo: loginMemberNo } = useAuthStore();

  const location = useLocation();
  const navigate = useNavigate();

  const path = location.pathname;
  const boardCode = boardCodeMap[path];

  const authorityMap = {
    1: "USER",
    2: "ADMIN",
  };
  const isAdmin = authorityMap[authority] === "ADMIN";

  useEffect(() => {
    if (!boardCode) return;

    axios
      .get(`/api/board/${boardCode}`)
      .then((res) => {
        setBoardList(res.data.boardList);
        setPagination(res.data.pagination);
        setLoading(false);
      })
      .catch((err) => {
        console.error("게시판 목록 조회 실패:", err);
        window.location.href = "/";
      });
  }, [boardCode]);

  if (!boardCode) return <p>존재하지 않는 게시판입니다.</p>;
  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>공지게시판</h2>

      <table
        style={{
          width: "100%",
          textAlign: "center",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #ccc" }}>
            <th>번호</th>
            <th>분류</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {boardList.map((board, index) => (
            <tr key={board.boardNo} style={{ borderBottom: "1px solid #eee" }}>
              <td>{index + 1}</td>
              <td>{board.postType}</td>
              <td>
                <Link to={`${path}/${board.boardNo}`}>
                  <strong>{board.boardTitle}</strong>
                </Link>
              </td>
              <td>{board.memberNickname}</td>
              <td>{board.boardDate}</td>
              <td>{board.boardReadCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAdmin && (
        <div style={{ textAlign: "right", marginTop: "1rem" }}>
          <button onClick={() => navigate(`/noticeBoard/write`)}>
            글 작성
          </button>
        </div>
      )}
    </div>
  );
};

export default NoticeBoard;
