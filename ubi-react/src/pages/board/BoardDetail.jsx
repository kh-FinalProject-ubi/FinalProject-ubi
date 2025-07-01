import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();
  const { token, role, memberNo: loginMemberNo } = useAuthStore();

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };
  const boardCode = boardCodeMap[boardPath];

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAlerted, setHasAlerted] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const isAdmin = role === "ADMIN";
  const isWriter = loginMemberNo === board?.memberNo;
  const isNotice = board?.boardType === 1;

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
          !(loginMemberNo === boardData.memberNo || isAdmin)
        ) {
          if (!hasAlerted) {
            alert("해당 게시글을 볼 권한이 없습니다.");
            setHasAlerted(true);
            setTimeout(() => navigate(`/${boardPath}`), 100);
          }
          return;
        }

        setBoard(boardData);
      } catch (err) {
        if (!hasAlerted) {
          alert(
            err.response?.status === 404
              ? "존재하지 않는 게시글입니다."
              : "오류가 발생했습니다."
          );
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
    role,
    loginMemberNo,
    navigate,
    boardPath,
    hasAlerted,
  ]);

  // 댓글 로딩
  const loadComments = async () => {
    setCommentLoading(true);
    try {
      const res = await axios.get(`/api/comments/${boardCode}/${boardNo}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setComments(res.data || []);
    } catch (err) {
      console.error("댓글 조회 실패", err);
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (boardCode && boardNo) loadComments();
  }, [boardCode, boardNo]);

  // 댓글 등록
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return alert("댓글 내용을 입력해주세요.");

    try {
      await axios.post(
        `/api/comments/${boardCode}/${boardNo}/insert`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment("");
      await loadComments();
    } catch (err) {
      alert("댓글 작성 실패");
    }
  };

  // 댓글 삭제
  const handleCommentDelete = async (commentNo) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/comments/${commentNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadComments();
    } catch (err) {
      alert("댓글 삭제 실패");
    }
  };

  // 댓글 수정
  const handleCommentUpdate = async (commentNo, content) => {
    const newContent = prompt("댓글 수정", content);
    if (!newContent?.trim()) return;

    try {
      await axios.put(
        `/api/comments`,
        { commentNo, content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await loadComments();
    } catch (err) {
      alert("댓글 수정 실패");
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!board) return <p>게시글 정보를 불러올 수 없습니다.</p>;

  return (
    <main className="container">
      <h1>{isNotice ? "공지게시판" : "문의게시판"}</h1>

      <section className="board-view">
        <h2>[{board.postType}]</h2>
        <h2 className="view-title">{board.boardTitle}</h2>

        <div className="content-box">
          <div
            className="board-content"
            dangerouslySetInnerHTML={{ __html: board.boardContent }}
          ></div>

          <div className="image-list">
            {board.imageList?.map((img, idx) => {
              const encodedName = encodeURIComponent(img.imageName);
              const filePath = `http://localhost:8080${img.imagePath}${encodedName}`;
              return (
                <img
                  key={idx}
                  src={filePath}
                  alt={`게시글 이미지 ${idx + 1}`}
                  style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
              );
            })}
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
                  const path = Object.entries(boardCodeMap).find(
                    ([, code]) => code === board.boardType
                  )?.[0];
                  path
                    ? navigate(`/${path}/edit/${board.boardNo}`)
                    : alert("게시판 경로를 찾을 수 없습니다.");
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
                        { headers: { Authorization: `Bearer ${token}` } }
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

        {/* 댓글 */}
        <section className="comment-section" style={{ marginTop: "40px" }}>
          <h3>댓글</h3>

          {commentLoading ? (
            <p>댓글 불러오는 중...</p>
          ) : comments.length === 0 ? (
            <p>댓글이 없습니다.</p>
          ) : (
            <ul>
              {comments.map((comment) => (
                <li key={comment.commentNo} style={{ marginBottom: "10px" }}>
                  <strong>
                    {comment.memberNickname || `회원번호: ${comment.memberNo}`}
                  </strong>{" "}
                  <span style={{ color: "#888", fontSize: "0.9em" }}>
                    ({new Date(comment.createdAt).toLocaleString()})
                  </span>
                  <p>{comment.content}</p>
                  {(isAdmin || comment.memberNo === loginMemberNo) && (
                    <div>
                      <button
                        className="btn-yellow"
                        onClick={() =>
                          handleCommentUpdate(
                            comment.commentNo,
                            comment.content
                          )
                        }
                      >
                        수정
                      </button>
                      <button
                        className="btn-yellow"
                        onClick={() => handleCommentDelete(comment.commentNo)}
                        style={{ marginLeft: "5px" }}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {token && (
            <form onSubmit={handleCommentSubmit}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="댓글을 입력하세요."
                style={{ width: "100%", resize: "vertical" }}
              />
              <button
                type="submit"
                className="btn-yellow"
                style={{ marginTop: "5px" }}
              >
                댓글 작성
              </button>
            </form>
          )}
        </section>
      </section>
    </main>
  );
};

export default BoardDetail;
