import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../styles/comment/Comment.module.css";
import CommentModal from "./CommentModal";
import useAuthStore from "../../stores/useAuthStore";

const CommentSection = ({ boardCode, boardNo, token, loginMemberNo }) => {
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentNo, setEditingCommentNo] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const [expandedComments, setExpandedComments] = useState(new Set());
  const { authority } = useAuthStore();

  const isAdmin = authority === "2";

  useEffect(() => {
    if (boardCode && boardNo) loadComments();
  }, [boardCode, boardNo, token, loginMemberNo]);

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return alert("댓글 내용을 입력해주세요.");
    try {
      await axios.post(
        `/api/comments/${boardCode}/${boardNo}`,
        { commentContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentContent("");
      await loadComments();
    } catch (err) {
      alert("댓글 작성 실패");
    }
  };

  const handleReplySubmit = async (e, parentNo) => {
    e.preventDefault();
    if (!replyContent.trim()) return alert("답글 내용을 입력해주세요.");
    try {
      await axios.post(
        `/api/comments/${boardCode}/${boardNo}`,
        {
          commentContent: replyContent,
          commentParentNo: parentNo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyContent("");
      setReplyTarget(null);
      await loadComments();
    } catch (err) {
      alert("답글 작성 실패");
    }
  };

  const handleReplyClick = (commentNo) => {
    setReplyTarget(replyTarget === commentNo ? null : commentNo);
    setReplyContent("");
  };

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

  const startEditing = (commentNo, currentContent) => {
    setEditingCommentNo(commentNo);
    setEditingContent(currentContent);
    setReplyTarget(null);
  };

  const saveEdit = async (commentNo) => {
    if (!editingContent.trim()) return alert("댓글 내용을 입력해주세요.");
    try {
      await axios.put(
        `/api/comments/${commentNo}`,
        { commentNo, commentContent: editingContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentNo(null);
      setEditingContent("");
      await loadComments();
    } catch (err) {
      alert("댓글 수정 실패");
    }
  };

  const cancelEdit = () => {
    setEditingCommentNo(null);
    setEditingContent("");
  };

  const handleReport = async (commentNo) => {
    try {
      const res = await axios.post(
        `/api/comments/${commentNo}/report`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const reported = res.data.reported;
      if (reported === true) {
        alert("신고 성공");
      } else if (reported === false) {
      } else {
        alert("알 수 없는 응답입니다");
      }
      await loadComments();
    } catch (err) {
      console.error("신고 실패:", err.response?.data || err.message);
    }
  };

  const handleCommentLike = async (commentNo) => {
    try {
      const res = await axios.post(
        `/api/comments/${commentNo}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedLikeStatus = res.data.liked;
      setComments((prev) =>
        prev.map((c) =>
          c.commentNo === commentNo
            ? {
                ...c,
                commentLiked: updatedLikeStatus,
                commentLike: updatedLikeStatus
                  ? c.commentLike + 1
                  : c.commentLike - 1,
              }
            : c
        )
      );
    } catch (err) {
      alert("좋아요 처리 실패");
      console.error(err);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1500) setCommentContent(value);
  };

  const handleReplyChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1500) setReplyContent(value);
  };

  const handleEditChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1500) setEditingContent(value);
  };

  const buildCommentTree = (comments) => {
    const map = {};
    const roots = [];
    comments.forEach((c) => (map[c.commentNo] = { ...c, children: [] }));
    comments.forEach((c) => {
      if (c.commentParentNo) {
        const parent = map[c.commentParentNo];
        if (parent) parent.children.push(map[c.commentNo]);
        else roots.push(map[c.commentNo]);
      } else roots.push(map[c.commentNo]);
    });
    return roots;
  };

  const toggleExpand = (commentNo) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentNo)) newSet.delete(commentNo);
      else newSet.add(commentNo);
      return newSet;
    });
  };

  const renderComment = (c, parentDeleted = false) => {
    const isDeleted = c.commentDelFl === "Y";
    const isMine = c.memberNo === loginMemberNo;
    const reportedByMe = (c.reportedByMe || 0) > 0;
    const isUser = c.memberNo !== null;

    const memberRoleStr =
      c.memberRole === "2" ? "ADMIN" : c.memberRole === "1" ? "USER" : "GUEST";
    const isWriterAdmin = memberRoleStr === "ADMIN";

    const isExpanded = expandedComments.has(c.commentNo);

    if (isDeleted)
      return (
        <ul className={styles.replyList}>
          {c.children.map((child) => renderComment(child, true))}
        </ul>
      );

    return (
      <li key={c.commentNo}>
        <div
          className={`${styles.commentItem} ${
            reportedByMe ? styles.reported : ""
          }`}
        >
          <div className={styles.commentContentArea}>
            <div className={styles.commentHeader}>
              <div className={styles.commentAuthorInfo}>
                <img
                  src={
                    c.memberImg
                      ? `https://kh-ubi.site${c.memberImg}`
                      : "/default-profile.png"
                  }
                  alt="프로필 사진"
                  className={styles.profileImg}
                  onError={(e) => {
                    e.currentTarget.onerror = null; // 무한 루프 방지
                    e.currentTarget.src = "/default-profileerror.png";
                  }}
                  onClick={(e) => {
                    const modalWidth = 300;
                    const modalHeight = 200;
                    let x = e.clientX + 20;
                    let y = e.clientY + 20;
                    if (x + modalWidth > window.innerWidth)
                      x = window.innerWidth - modalWidth - 10;
                    if (y + modalHeight > window.innerHeight)
                      y = window.innerHeight - modalHeight - 50;

                    setSelectedMember({
                      memberNo: c.memberNo,
                      memberImg: c.memberImg,
                      memberNickname: c.memberNickname,
                      memberRole: c.memberRole,
                    });
                    setModalPosition({ x, y });
                    setModalVisible(true);
                  }}
                />
                <strong>{c.memberNickname}</strong>
                <span className={styles.commentDate}>{c.commentDate}</span>
                {token &&
                  !isMine &&
                  isUser &&
                  !isWriterAdmin &&
                  boardCode !== 2 && (
                    <button
                      className={styles.reportBtn}
                      onClick={() => handleReport(c.commentNo)}
                    >
                      <img src="/report.svg" alt="신고" />
                    </button>
                  )}
              </div>
              {token && (isAdmin || isMine) && (
                <div className={styles.commentActionsRight}>
                  {editingCommentNo === c.commentNo ? (
                    <>
                      <button onClick={() => saveEdit(c.commentNo)}>
                        저장
                      </button>
                      <button onClick={cancelEdit}>취소</button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          startEditing(c.commentNo, c.commentContent)
                        }
                      >
                        수정
                      </button>
                      <button onClick={() => handleCommentDelete(c.commentNo)}>
                        삭제
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {parentDeleted && (
              <div className={styles.parentDeletedNotice}>
                삭제된 댓글의 답글입니다.
              </div>
            )}

            {editingCommentNo === c.commentNo ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={
                    ((e) => setEditingContent(e.target.value), handleEditChange)
                  }
                  rows={3}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </>
            ) : reportedByMe ? (
              <p className={styles.reportedCommentText}>신고한 댓글입니다.</p>
            ) : (
              <>
                <p
                  className={styles.commentText}
                  style={
                    isExpanded
                      ? { display: "block" }
                      : {
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }
                  }
                >
                  {c.commentContent}
                </p>
              </>
            )}

            {token && !reportedByMe && (
              <div className={styles.commentActionsBottom}>
                <div className={styles.leftActions}>
                  {editingCommentNo !== c.commentNo && (
                    <button
                      className={`${styles.commentLikeBtn} ${
                        c.commentLiked ? styles.liked : ""
                      }`}
                      onClick={() => handleCommentLike(c.commentNo)}
                    >
                      <img src="/commentLike.svg" alt="좋아요" />
                    </button>
                  )}
                  <span className={styles.likeCount}>{c.commentLike}</span>

                  <button
                    className={styles.replyBtn}
                    onClick={() => {
                      cancelEdit();
                      handleReplyClick(c.commentNo);
                    }}
                  >
                    답글
                  </button>
                </div>

                {c.commentContent.length > 100 && (
                  <button
                    className={styles.moreBtnBottom}
                    onClick={() => toggleExpand(c.commentNo)}
                  >
                    {isExpanded ? "닫기" : "더보기"}
                  </button>
                )}
              </div>
            )}

            {token && replyTarget === c.commentNo && !reportedByMe && (
              <form
                onSubmit={(e) => handleReplySubmit(e, c.commentNo)}
                className={styles.replyForm}
              >
                <textarea
                  value={replyContent}
                  onChange={
                    ((e) => setReplyContent(e.target.value), handleReplyChange)
                  }
                  rows={3}
                  placeholder="답글을 입력하세요."
                  style={{ width: "100%", resize: "vertical" }}
                />
                <button type="submit">
                  답글 <br />
                  작성
                </button>
              </form>
            )}
          </div>
        </div>

        {c.children.length > 0 && (
          <ul className={styles.replyList}>
            {c.children.map((child) => renderComment(child, parentDeleted))}
          </ul>
        )}
      </li>
    );
  };

  const commentTree = buildCommentTree(comments);

  return (
    <section className={styles.commentSection}>
      <h3>댓글 {comments.filter((c) => c.commentDelFl !== "Y").length}</h3>

      {token && (
        <form onSubmit={handleCommentSubmit} className={styles.commentForm}>
          <textarea
            value={commentContent}
            onChange={
              ((e) => setCommentContent(e.target.value), handleCommentChange)
            }
            rows={3}
            placeholder="댓글을 입력하세요."
          />
          <button type="submit">
            댓글 <br />
            작성
          </button>
        </form>
      )}

      {commentLoading ? (
        <p>댓글을 불러오는 중...</p>
      ) : commentTree.length > 0 ? (
        <ul>{commentTree.map((c) => renderComment(c, false))}</ul>
      ) : (
        <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>
          작성된 댓글이 없습니다.
        </p>
      )}

      {token &&
        modalVisible &&
        selectedMember &&
        selectedMember.memberRole !== "2" &&
        selectedMember.memberNo !== loginMemberNo && (
          <CommentModal
            member={selectedMember}
            position={modalPosition}
            token={token}
            onClose={() => setModalVisible(false)}
            loadComments={loadComments}
          />
        )}
    </section>
  );
};

export default CommentSection;
