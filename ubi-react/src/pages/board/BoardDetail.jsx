import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore"; // Zustand 등 토큰, 회원정보 관리 스토어

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();
  const { token, authority, memberNo: loginMemberNo } = useAuthStore();

  // boardPath -> boardCode 매핑 (ex: noticeBoard -> 1, askBoard -> 2)
  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };
  const boardCode = boardCodeMap[boardPath];

  const [board, setBoard] = useState(null);

  // 권한 체크 후 이동 및 alert 중복 방지용
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    console.log("=== BoardDetail useEffect ===");
    console.log("토큰:", token);
    console.log("authority:", authority);
    console.log("loginMemberNo:", loginMemberNo);

    if (!boardCode) {
      if (!hasAlerted) {
        alert("잘못된 게시판 경로입니다.");
        setHasAlerted(true);
      }
      navigate("/");
      return;
    }

    if (!token) {
      if (!hasAlerted) {
        alert("로그인이 필요합니다.");
        setHasAlerted(true);
        navigate(`/${boardPath}`);
      }
      return;
    }

    const fetchBoard = async () => {
      try {
        const res = await axios.get(`/api/board/${boardCode}/${boardNo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const boardData = res.data.board;

        // 문의게시판이면 작성자 or 관리자만 볼 수 있음
        if (
          boardCode === 2 &&
          !(loginMemberNo === boardData.memberNo || role === "ADMIN")
        ) {
          if (!hasAlerted) {
            alert("해당 게시글을 볼 권한이 없습니다.");
            setHasAlerted(true);
          }
          navigate(`/${boardPath}`);
          return;
        }

        // 공지게시판은 모두 조회 가능
        setBoard(boardData);
      } catch (err) {
        if (!hasAlerted) {
          if (err.response?.status === 404) {
            alert("존재하지 않는 게시글입니다.");
          } else if (err.response?.status === 403) {
            alert("해당 게시글을 볼 권한이 없습니다.");
          } else {
            alert("오류가 발생했습니다.");
          }
          setHasAlerted(true);
        }
        navigate(`/${boardPath}`);
      }
    };

    fetchBoard();
  }, [
    boardCode,
    boardNo,
    token,
    authority,
    loginMemberNo,
    navigate,
    boardPath,
    hasAlerted,
  ]);

  if (!board) return <p>로딩 중...</p>;

  const isWriter = loginMemberNo === board.memberNo;
  const isAdmin = authority === "ADMIN";
  const isNotice = board?.boardType === 1;

  return (
    <main className="container">
      <h1>{isNotice ? "공지게시판" : "문의게시판"}</h1>

      <section className="board-view">
        <h2 className="view-title">{board.boardTitle}</h2>
        <div className="content-box">
          <p>{board.boardContent}</p>
          <p>조회수: {board.boardReadCount}</p>
          <p>작성자 번호: {board.memberNo}</p>
        </div>

        <div className="btn-box">
          <button
            className="btn-yellow"
            onClick={() => navigate(`/${boardPath}`)}
          >
            목록
          </button>

          {/* 공지게시판은 모두 읽기 가능하므로 버튼은 작성자 or 관리자만 보여야 함 */}
          {(isWriter || isAdmin) && (
            <>
              <button
                className="btn-yellow"
                onClick={() => navigate(`/editBoard/${boardCode}/${boardNo}`)}
              >
                수정
              </button>
              <button
                className="btn-yellow"
                onClick={() => {
                  if (window.confirm("정말 삭제하시겠습니까?")) {
                    axios
                      .post(
                        `/api/editBoard/${boardCode}/${boardNo}/delete`,
                        {},
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      )
                      .then(() => {
                        alert("삭제되었습니다.");
                        navigate(`/${boardPath}`);
                      })
                      .catch(() => alert("삭제 실패"));
                  }
                }}
              >
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
