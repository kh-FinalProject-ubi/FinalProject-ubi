import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import CommentSection from "../comment/Comment";
import styles from "../../styles/board/BoardDetail.module.css";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();
  const { token, role, memberNo: loginMemberNo } = useAuthStore();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };
  const boardCode = boardCodeMap[boardPath];

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAlerted, setHasAlerted] = useState(false);

  const isAdmin = role === "ADMIN";
  const isWriter = loginMemberNo === board?.memberNo;

  // 게시글 상세 조회 및 초기 상태 세팅
  useEffect(() => {
    if (!boardCode) {
      if (!hasAlerted) {
        alert("잘못된 게시판 경로입니다.");
        setHasAlerted(true);
      }
      navigate("/");
      return;
    }

    const fetchBoard = async () => {
      try {
        const res = await axios.get(`/api/board/${boardCode}/${boardNo}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const boardData = res.data.board;

        // 권한 체크 (예: 문의게시판 비공개글 권한 제한)
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

        // 좋아요 개수와 상태를 서버에서 받아서 세팅
        setLikeCount(res.data.likeCount ?? 0);
        console.log("초기 isLiked 값:", res.data.isLiked);
        setLiked(res.data.isLiked === 1);
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
    loginMemberNo,
    navigate,
    boardPath,
    hasAlerted,
    isAdmin,
  ]);

  // 게시글 삭제 핸들러
  const handleDelete = () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      axios
        .delete(`/api/editBoard/${boardCode}/${boardNo}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          alert("삭제되었습니다.");
          navigate(`/${boardPath}`);
        })
        .catch(() => alert("삭제 실패"));
    }
  };

  // 좋아요 클릭 처리
  const handleLike = async () => {
    if (loginMemberNo === board.memberNo) {
      alert("본인의 글에는 좋아요를 누를 수 없습니다.");
      return;
    }

    try {
      // likeCheck: true(1)면 좋아요 해제 -> DB에서 삭제 요청
      // false(0)면 좋아요 누름 -> DB에 insert 요청
      const res = await axios.post(`/api/board/${board.boardNo}/like`, {
        memberNo: loginMemberNo,
        writerNo: board.memberNo,
        likeCheck: liked ? 1 : 0,
      });

      // 서버에서 최신 좋아요 상태와 개수를 받음
      console.log("좋아요 응답:", res.data);

      setLikeCount(res.data.likeCount ?? 0);
      setLiked(res.data.isLiked === 1);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (!board) return <p>게시글 정보를 불러올 수 없습니다.</p>;

  return (
    <main className={styles.container}>
      <div className={styles.pageHeaderContainer}>
        <h2 className={styles.pageTitle}>
          {boardPath === "noticeBoard" && "공지사항"}
          {boardPath === "askBoard" && "문의게시판"}
          {boardPath === "mytownBoard" && "우리 동네 좋아요"}
        </h2>
        <span className={styles.tag}>{board.postType}</span>
      </div>

      <section>
        <div className={styles.boardHeader}>
          <div className={styles.titleContainer}>
            <div className={styles.titleGroup}>
              <h3 className={styles.boardTitle}>{board.boardTitle}</h3>
            </div>
            <div className={styles.buttonContainer}>
              {(isWriter || isAdmin) && (
                <>
                  <button
                    className={styles.editButton}
                    onClick={() => navigate(`/${boardPath}/${boardNo}/edit`)}
                  >
                    수정
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
          <div className={styles.metaContainer}>
            <div className={styles.userInfo}>
              <img
                src={
                  `http://localhost:8080${board.memberImg}` ||
                  "/default-profile.png"
                }
                alt="프로필"
                className={styles.profileImg}
              />

              <div className={styles.authorInfo}>
                <span className={styles.authorNickname}>
                  {board.memberNickname}
                </span>
                <span className={styles.boardDate}>{board.boardDate}</span>
              </div>
            </div>
            <div className={styles.stats}>
              <div className={styles.stats}>
                {boardCode === 1 && (
                  <button
                    onClick={handleLike}
                    style={{
                      marginLeft: "10px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  >
                    {liked ? "❤️" : "🤍"} {likeCount}
                  </button>
                )}
              </div>
              <span>조회 {board.boardReadCount}</span>
            </div>
          </div>
        </div>

        <div
          className={styles.boardContent}
          dangerouslySetInnerHTML={{ __html: board.boardContent }}
        ></div>

        <div className={styles.bottomButtonContainer}>
          <button
            className={styles.listButton}
            onClick={() => navigate(`/${boardPath}`)}
          >
            목록
          </button>
        </div>

        <div className={styles.commentSection}>
          <CommentSection
            boardCode={boardCode}
            boardNo={boardNo}
            token={token}
            loginMemberNo={loginMemberNo}
            role={role}
          />
        </div>
      </section>
    </main>
  );
};

export default BoardDetail;
