import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/comment/Comment.css";
import CommentModal from "./CommentModal";

const CommentSection = ({ boardCode, boardNo, token, loginMemberNo, role }) => {
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

  // 로그인한 회원이 관리자인지 구분
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (boardCode && boardNo) loadComments();
  }, [boardCode, boardNo, token, loginMemberNo]);

  const loadComments = async () => {
    setCommentLoading(true);
    try {
      const res = await axios.get(`/api/comments/${boardCode}/${boardNo}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      console.log("서버에서 받은 댓글 데이터", res.data);
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
        alert("신고 취소 완료");
      } else {
        alert("알 수 없는 응답입니다");
      }
      await loadComments();
    } catch (err) {
      console.error("신고 실패:", err.response?.data || err.message);
      alert("신고 실패");
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

  const renderComment = (c, parentDeleted = false) => {
    const isDeleted = c.commentDelFl === "Y";
    const isMine = c.memberNo === loginMemberNo;
    const reportedByMe = (c.reportedByMe || 0) > 0;
    const isUser = c.memberNo !== null;
    // 댓글 작성자가 관리자인 경우
    const memberRoleStr =
      c.memberRole === "2" ? "ADMIN" : c.memberRole === "1" ? "USER" : "GUEST";
    const isWriterAdmin = memberRoleStr === "ADMIN";

    // 삭제된 댓글이고 자식도 없으면 표시하지 않음
    if (isDeleted && c.children.length === 0) return null;

    return (
      <li key={c.commentNo}>
        <div className={`comment-item ${reportedByMe ? "reported" : ""}`}>
          <div className="comment-content-area">
            <div className="comment-header">
              <div className="comment-author-info">
                <img
                  src={c.memberImg || "/default-profile.png"}
                  alt="프로필 사진"
                  className="profile-img"
                  onClick={(e) => {
                    const modalWidth = 300;
                    const modalHeight = 200;

                    let x = e.clientX + 20;
                    let y = e.clientY + 20;

                    // 화면 넘지 않게 조정
                    if (x + modalWidth > window.innerWidth) {
                      x = window.innerWidth - modalWidth - 10;
                    }

                    if (y + modalHeight > window.innerHeight) {
                      y = window.innerHeight - modalHeight - 50;
                    }

                    setSelectedMember({
                      memberImg: c.memberImg,
                      memberNickname: c.memberNickname,
                      memberNo: c.memberNo,
                      memberRole: c.memberRole,
                    });
                    setModalPosition({ x, y });
                    setModalVisible(true);
                  }}
                />
                <strong>{c.memberNickname}</strong>
                <span className="comment-date">{c.commentDate}</span>

                {/* 신고/취소 버튼 */}
                {token &&
                  !isMine &&
                  isUser &&
                  !isWriterAdmin &&
                  boardCode !== 2 && (
                    <button
                      className="report-btn"
                      onClick={() => handleReport(c.commentNo)}
                    >
                      <img src="/report.svg" alt="신고 아이콘" />
                    </button>
                  )}
              </div>

              {/* 수정/삭제 버튼 (본인 or 관리자) */}
              {(isAdmin || isMine) && editingCommentNo !== c.commentNo && (
                <div className="comment-actions-right">
                  <button
                    onClick={() => startEditing(c.commentNo, c.commentContent)}
                  >
                    수정
                  </button>
                  <button onClick={() => handleCommentDelete(c.commentNo)}>
                    삭제
                  </button>
                </div>
              )}
            </div>

            {parentDeleted && (
              <div className="parent-deleted-notice">
                삭제된 댓글의 답글입니다.
              </div>
            )}

            {/* 댓글 내용 */}
            {editingCommentNo === c.commentNo ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  rows={3}
                  style={{ width: "100%", resize: "vertical" }}
                />
                <div>
                  <button onClick={() => saveEdit(c.commentNo)}>저장</button>
                  <button onClick={cancelEdit}>취소</button>
                </div>
              </>
            ) : reportedByMe ? (
              <p className="comment-text reported-comment-text">
                신고한 댓글입니다.
              </p>
            ) : (
              <p className="comment-text">{c.commentContent}</p>
            )}

            {/* 좋아요 / 답글 */}
            {token && !editingCommentNo && !reportedByMe && (
              <>
                <button
                  className={`comment-like-btn ${
                    c.commentLiked ? "liked" : ""
                  }`}
                  onClick={() => handleCommentLike(c.commentNo)}
                >
                  <img src="/commentLike.svg" alt="좋아요 아이콘" />
                </button>
                <span>{c.commentLike}</span>
                <button onClick={() => handleReplyClick(c.commentNo)}>
                  답글
                </button>
              </>
            )}

            {/* 답글 작성 폼 */}
            {token && replyTarget === c.commentNo && !reportedByMe && (
              <form
                onSubmit={(e) => handleReplySubmit(e, c.commentNo)}
                style={{ marginTop: "10px" }}
              >
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={3}
                  placeholder="답글을 입력하세요."
                  style={{ width: "100%", resize: "vertical" }}
                />
                <button
                  type="submit"
                  className="btn-yellow"
                  style={{ marginTop: "5px" }}
                >
                  답글 작성
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 자식 댓글 렌더링 */}
        {c.children.length > 0 && (
          <ul className="reply-list">
            {c.children.map((child) => renderComment(child, isDeleted))}
          </ul>
        )}
      </li>
    );
  };
  const commentTree = buildCommentTree(comments);

  return (
    <section className="comment-section">
      <h3>댓글 {comments.filter((c) => c.commentDelFl !== "Y").length}</h3>

      {token && (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            rows={3}
            placeholder="댓글을 입력하세요."
          />
          <button type="submit" className="btn-yellow">
            댓글 작성
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

      {modalVisible &&
        selectedMember &&
        selectedMember.memberRole !== "2" &&
        selectedMember.memberNo !== loginMemberNo && (
          <CommentModal
            member={selectedMember}
            position={modalPosition}
            onClose={() => setModalVisible(false)}
          />
        )}
    </section>
  );
};

export default CommentSection;
