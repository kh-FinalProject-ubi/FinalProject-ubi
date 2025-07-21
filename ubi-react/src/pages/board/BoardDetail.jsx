import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import CommentSection from "../comment/Comment";
import styles from "../../styles/board/BoardDetail.module.css";
import CommentModal from "../comment/CommentModal";

const BoardDetail = () => {
  const navigate = useNavigate();
  const { boardPath, boardNo } = useParams();
  const { token, role, memberNo: loginMemberNo, authority } = useAuthStore();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAlerted, setHasAlerted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
const [selectedMember, setSelectedMember] = useState(null);

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
    mytownBoard: 3,
  };
  const boardCode = boardCodeMap[boardPath];
  const isAdmin = authority === "2";
  const isWriter = loginMemberNo === board?.memberNo;

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
        setLikeCount(res.data.likeCount ?? 0);
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

  const handleLike = async () => {
    if (loginMemberNo === board.memberNo) {
      alert("본인의 글에는 좋아요를 누를 수 없습니다.");
      return;
    }
  
    if (!token) {
      alert("비회원은 좋아요를 누를 수 없습니다.");
      return;
    }
  
    try {
      const res = await axios.post(`/api/board/${board.boardNo}/like`, {
        memberNo: loginMemberNo,
        writerNo: board.memberNo,
        likeCheck: liked ? 1 : 0,
      });
  
      setLikeCount(res.data.likeCount ?? 0);
      setLiked(res.data.isLiked === 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.contentWrapper}>
        {loading ? (
          <div className={styles.loadingWrapper}>
            <p>로딩 중...</p>
          </div>
        ) : !board ? (
          <p>게시글 정보를 불러올 수 없습니다.</p>
        ) : (
          <>
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
                    {token && (isWriter || isAdmin) && (
                      <>
                        <button
                          className={styles.editButton}
                          onClick={() =>
                            navigate(`/${boardPath}/${boardNo}/edit`)
                          }
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
  src={board.memberImg ? `http://localhost:8080${board.memberImg}` : "/default-profile.png"}
  alt="프로필"
  className={styles.profileImg}
  onClick={(e) => {
    setSelectedMember({
      memberNo: board.memberNo,
      memberImg: board.memberImg,
      memberNickname: board.memberNickname,
      role: board.authority === "2" ? "ADMIN" : "USER",
    });
    setModalPosition({ x: e.clientX + 50, y: e.clientY });
    setModalVisible(true);
  }}
/>
                    <div className={styles.authorInfo}>
                      <span className={styles.authorNickname}>
                        {board.memberNickname}
                      </span>
                      <span className={styles.boardDate}>
                        {board.boardDate}
                      </span>
                    </div>
                  </div>
                  <div className={styles.stats}>
                    {boardCode === 1 && (
                      <button onClick={handleLike}>
                        {liked ? "❤️" : "🤍"} {likeCount}
                      </button>
                    )}
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
          </>
        )}
              {modalVisible &&
            selectedMember &&
            selectedMember.role !== "ADMIN" &&
            selectedMember.memberNo !== loginMemberNo && (
              <CommentModal
                member={selectedMember}
                token={token}
                position={modalPosition}
                onClose={() => setModalVisible(false)}
              />
            )}
      </div>
    </main>
  );
};

export default BoardDetail;
