import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore"; // ✅ 문제 2 해결: auth 스토어 import

const boardCodeMap = {
  "/noticeBoard": 1,
  "/askBoard": 2,
};

const authorityMap = {
  1: "USER",
  2: "ADMIN",
};

// ✅ 문제 1 해결: 컴포넌트 이름을 대문자로 시작 (askBoard -> AskBoard)
const AskBoard = () => {
  const [boardList, setBoardList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // ✅ 문제 2 해결: useAuthStore에서 authority 값을 가져옴
  const { authority } = useAuthStore();

  const path = location.pathname;
  const boardCode = boardCodeMap[path];

  // authority 값이 있을 때만 isAdmin, isUser를 계산
  const isAdmin = authority && authorityMap[authority] === "ADMIN";
  const isUser = authority && authorityMap[authority] === "USER";

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
        alert("게시판을 불러오는 데 실패했습니다.");
        // ✅ 문제 4 개선: window.location.href 대신 navigate 사용
        navigate("/");
      });
  }, [boardCode, navigate]); // useEffect 의존성 배열에 navigate 추가

  if (!boardCode) return <p>존재하지 않는 게시판입니다.</p>;
  if (loading) return <p>로딩 중...</p>;

  return (
    <div>
      <h2>문의게시판</h2>
      {/* 테이블 형태로 변경하여 가독성 개선 (선택 사항) */}
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
              <td>{index + 1}</td>
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

      {/* ✅ 문제 3 해결: &&를 ||로 변경하여 '로그인한 사용자'가 글을 쓸 수 있도록 함 */}
      {(isAdmin || isUser) && (
        <button
          onClick={() => navigate(`${path}/write`)} // 현재 경로를 기반으로 동적 링크 생성
          style={{ marginTop: "1rem", float: "right" }}
        >
          글 작성
        </button>
      )}
    </div>
  );
};

// ✅ 문제 1 해결: 대문자로 시작하는 컴포넌트 이름으로 export
export default AskBoard;
