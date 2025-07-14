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

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
    mytownBoard: 3, // "우리 동네 좋아요" 게시판 코드 추가
  };
  const boardCode = boardCodeMap[boardPath];

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAlerted, setHasAlerted] = useState(false);

  const isAdmin = role === "ADMIN";
  const isWriter = loginMemberNo === board?.memberNo;

  // 게시글 상세 조회 (기존 로직 유지)
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

        // 문의게시판 게시글 권한 확인 (수정된 부분)
        if (
          boardCode === 2 && // 문의게시판이고,
          !(loginMemberNo === boardData.memberNo || isAdmin) // 작성자나 관리자가 아니라면
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

  if (loading) return <p>로딩 중...</p>;
  if (!board) return <p>게시글 정보를 불러올 수 없습니다.</p>;

  return (
    <main className={styles.container}>
      <h2 className={styles.pageTitle}>
        {boardPath === "noticeBoard" && "공지사항"}
        {boardPath === "askBoard" && "문의게시판"}
        {boardPath === "mytownBoard" && "우리 동네 좋아요"}
      </h2>

      <section>
        <div className={styles.boardHeader}>
          <div className={styles.titleContainer}>
            <h3 className={styles.boardTitle}>{board.boardTitle}</h3>
            <span className={styles.tag}>{board.postType}</span>
          </div>
          <div className={styles.metaContainer}>
            <div className={styles.userInfo}>
              <img
                src={board.memberImg || "/default-profile.png"}
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
              <span>❤️ {board.likeCount || 0}</span>
              <span>조회 {board.boardReadCount}</span>
            </div>
          </div>
        </div>

        <div
          className={styles.boardContent}
          dangerouslySetInnerHTML={{ __html: board.boardContent }}
        ></div>

        <div className={styles.buttonContainer}>
          <button
            className={styles.listButton}
            onClick={() => navigate(`/${boardPath}`)}
          >
            목록
          </button>
          {(isWriter || isAdmin) && (
            <>
              <button
                className={styles.editButton}
                onClick={() => navigate(`/${boardPath}/${boardNo}/edit`)}
              >
                수정
              </button>
              <button className={styles.deleteButton} onClick={handleDelete}>
                삭제
              </button>
            </>
          )}
        </div>

        <div className={styles.commentSection}>
          <h4 className={styles.commentTitle}>댓글</h4>
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
