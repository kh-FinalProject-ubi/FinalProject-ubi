import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { h1 } from "framer-motion/client";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();
  const [loginMemberNo, setLoginMemberNo] = useState(null);

  const [board, setBoard] = useState(null);

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };

  const boardCode = boardCodeMap[boardPath];

  const handleList = () => navigate(-1);
  const handleEdit = () => navigate(`/editBoard/${boardCode}/${boardNo}`);
  const handleDelete = () => alert("삭제 기능 호출");

  if (!boardCode) {
    alert("잘못된 게시판 경로입니다.");
    navigate("/");
    return null;
  }

  useEffect(() => {
    axios
      .get(`/api/board/${boardCode}/${boardNo}`, { withCredentials: true })
      .then((res) => {
        console.log("받은 데이터:", res.data);
        console.log("board.memberNo:", res.data.board.memberNo);
        console.log("loginMemberNo:", res.data.loginMemberNo);
        setBoard(res.data.board);
        setLoginMemberNo(res.data.loginMemberNo); // 로그인한 사용자 ID
      })
      .catch((err) => {
        console.error("게시글 로딩 실패", err);
        if (err.response?.status === 404) {
          alert("존재하지 않는 게시글입니다.");
          navigate(`/${boardPath}`);
        }
      });
  }, [boardCode, boardNo]);

  return (
    <main className="container">
      {boardCode === 1 ? (
        <h1>공지게시판</h1>
      ) : boardCode === 2 ? (
        <h1>문의게시판</h1>
      ) : null}
      <section className="board-view">
        {!board ? (
          <p>로딩 중...</p>
        ) : (
          <>
            <h2 className="view-title">{board.boardTitle}</h2>
            <div className="content-box">
              <p>{board.boardContent}</p>
              <p>{board.boardReadCount}</p>
            </div>
          </>
        )}
        <div className="btn-box">
          <button className="btn-yellow" onClick={handleList}>
            목록
          </button>
          {board && Number(loginMemberNo) === Number(board.memberNo) && (
            <>
              <button className="btn-yellow" onClick={handleEdit}>
                수정
              </button>
              <button className="btn-yellow" onClick={handleDelete}>
                삭제
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default BoardDetail;
