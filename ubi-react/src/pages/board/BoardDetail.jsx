import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();
  const { token, authority, memberNo: loginMemberNo } = useAuthStore();

  // 게시판 이름 -> 코드 매핑
  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };
  const boardCode = boardCodeMap[boardPath];

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    if (!boardCode) {
      if (!hasAlerted) {
        alert("잘못된 게시판 경로입니다.");
        setHasAlerted(true);
      }
      navigate("/");
      return;
    }

    if (!token && boardCode === 2) {
      // 문의게시판은 비로그인 접근 불가
      if (!hasAlerted) {
        alert("로그인이 필요합니다.");
        setHasAlerted(true);
      }
      navigate(`/${boardPath}`);
      return;
    }

    const fetchBoard = async () => {
      try {
        const res = await axios.get(`/api/board/${boardCode}/${boardNo}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        const boardData = res.data.board;

        if (
          boardCode === 2 &&
          !(loginMemberNo === boardData.memberNo || authority === "ADMIN")
        ) {
          if (!hasAlerted) {
            alert("해당 게시글을 볼 권한이 없습니다.");
            setHasAlerted(true);
            setTimeout(() => navigate(`/${boardPath}`), 100);
            setLoading(false);
          }

          return;
        }

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
          setTimeout(() => navigate(`/${boardPath}`), 100);
        }
      } finally {
        setLoading(false);
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

  if (loading || !board) return null;

  const isWriter = loginMemberNo === board.memberNo;
  const isAdmin = authority === "ADMIN";
  const isNotice = board.boardType === 1;

  return (
    <main className="container">
      <h1>{isNotice ? "공지게시판" : "문의게시판"}</h1>

      <section className="board-view">
        <h2 className="view-title">{board.boardTitle}</h2>
        <div className="content-box">
          <div
            className="board-content"
            dangerouslySetInnerHTML={{ __html: board.boardContent }}
          ></div>

          <div className="image-list">
            {board.imageList && board.imageList.length > 0
              ? board.imageList.map((img, index) => {
                  const encodedFileName = encodeURIComponent(img.imageName);
                  const filePath = `http://localhost:80${img.imagePath}${encodedFileName}`;
                  return (
                    <img
                      key={index}
                      src={filePath}
                      alt={`게시글 이미지 ${index + 1}`}
                      style={{ maxWidth: "100%", marginBottom: "10px" }}
                    />
                  );
                })
              : null}
          </div>

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

          {(isWriter || isAdmin) && (
            <>
              <button
                className="btn-yellow"
                onClick={() => {
                  // boardType → boardPath 다시 변환
                  const path = Object.entries(boardCodeMap).find(
                    ([, code]) => code === board.boardType
                  )?.[0];

                  if (path) {
                    navigate(`/${path}/edit/${board.boardNo}`);
                  } else {
                    alert("게시판 경로를 찾을 수 없습니다.");
                  }
                }}
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
