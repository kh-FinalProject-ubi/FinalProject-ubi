import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, Navigate, useLocation } from "react-router-dom";
import { div, li } from "framer-motion/client";
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
  const path = location.pathname;
  const boardCode = boardCodeMap[path];
  // 권한 체크 후 이동 및 alert 중복 방지용
  const [hasAlerted, setHasAlerted] = useState(false);
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
      <ul>
        {boardList.map((board, index) => (
          <li key={board.boardNo}>
            <Link to={`/${path.split("/")[1]}/detail/${board.boardNo}`}>
              {index + 1} &nbsp;&nbsp;&nbsp;
              {board.postType} &nbsp; &nbsp; &nbsp;
              <strong>{board.boardTitle}</strong>&nbsp; &nbsp; &nbsp;
              {board.memberNickname}&nbsp; &nbsp; &nbsp;
              {board.boardDate}
              &nbsp;&nbsp;&nbsp;
              {board.boardAnswer}&nbsp;&nbsp;&nbsp;
              {board.boardReadCount}
            </Link>
          </li>
        ))}
      </ul>
      {isAdmin && (
        <button onClick={() => Navigate(`/editBoard/${boardCode}/insert`)}>
          글 작성
        </button>
      )}
    </div>
  );
};

export default NoticeBoard;
