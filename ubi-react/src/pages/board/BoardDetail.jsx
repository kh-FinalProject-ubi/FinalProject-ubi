import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();

  const { token, address, memberName, memberStandard, memberNo } =
    useAuthStore();
  const [board, setBoard] = useState(null);
  const [loginMemberNo, setLoginMemberNo] = useState(null);

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };

  const boardCode = boardCodeMap[boardPath];

  const handleList = () => navigate(-1);
  const handleEdit = () => navigate(`/editBoard/${boardCode}/${boardNo}`);
  const handleDelete = () => alert("삭제 기능 호출");

  // 유효하지 않은 게시판 경로
  if (!boardCode) {
    alert("잘못된 게시판 경로입니다.");
    navigate("/");
    return null;
  }

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    axios
      .get(`/api/board/${boardCode}/${boardNo}`, { withCredentials: true })
      .then((res) => {
        const { board, loginMemberNo } = res.data;

        const isWriter = Number(loginMemberNo) === Number(board.memberNo);
        const isAdmin = memberStandard === true;

        if (!isWriter && !isAdmin) {
          alert("해당 게시글을 볼 권한이 없습니다.");
          navigate(`/${boardPath}`);
          return;
        }
        console.log(res.data.board);
        setBoard(board);
        setLoginMemberNo(loginMemberNo);
      })
      .catch((err) => {
        console.error("게시글 로딩 실패", err);
        if (err.response?.status === 404) {
          alert("존재하지 않는 게시글입니다.");
          navigate(`/${boardPath}`);
        }
      });
  }, [boardCode, boardNo, token, memberStandard]);

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
              <p>조회수: {board.boardReadCount}</p>
            </div>
          </>
        )}

        <div className="btn-box">
          <button className="btn-yellow" onClick={handleList}>
            목록
          </button>

          {board &&
            (Number(loginMemberNo) === Number(board.memberNo) ||
              memberStandard === true) && (
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
