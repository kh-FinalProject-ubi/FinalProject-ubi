import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { h1 } from "framer-motion/client";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();

  const [board, setBoard] = useState(null);

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };

  const boardCode = boardCodeMap[boardPath];

  const handleList = () => navigate(-1);
  const handleEdit = () => alert("수정 페이지로 이동");
  const handleDelete = () => alert("삭제 기능 호출");

  useEffect(() => {
    axios
      .get(`/api/board/${boardCode}/${boardNo}`, {
        withCredentials: true,
      })
      .then((res) => setBoard(res.data))
      .catch((err) => {
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
            <div className="hashtags">
              {board.hashtagList?.map((tag, idx) => (
                <span key={idx} className="hashtag">
                  {tag}
                </span>
              ))}
            </div>
            <div className="content-box">
              <p>{board.boardContent}</p>
            </div>
          </>
        )}
        <div className="btn-box">
          <button className="btn-yellow" onClick={handleList}>
            목록
          </button>
          <button className="btn-yellow" onClick={handleEdit}>
            수정
          </button>
          <button className="btn-yellow" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </section>
    </main>
  );
};

export default BoardDetail;
