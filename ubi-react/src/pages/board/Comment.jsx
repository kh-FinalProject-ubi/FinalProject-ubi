import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Comment.css";

const CommentSection = ({ boardCode, boardNo, token, loginMemberNo, role }) => {
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentNo, setEditingCommentNo] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const isAdmin = role === "ADMIN";

  useEffect(() => {
    if (boardCode && boardNo) loadComments();
  }, [boardCode, boardNo]);

  // 댓글 불러오기
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

  // 댓글 작성
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

  // 답글 입력 (댓글 입력과 같은 post)
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
    setReplyTarget(null); // 답글 창 닫기
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

  // 신고하는 함수
  const handleReport = async (commentNo) => {
    try {
      await axios.post(`/api/comments/${commentNo}/report`, 
        {},
       { headers: { Authorization: `Bearer ${token}`, },});
       alert("신고성공");
    } catch (err) {
      alert("신고 실패");
    }
  };

  // 좋아요 함수
  const handleCommentLike = async (commentNo) => {
    try {
      const res = await axios.post(
        `/api/comments/${commentNo}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedLikeStatus = res.data.liked; // true: 좋아요 추가, false: 좋아요 취소

      // 해당 댓글만 업데이트
      setComments((prev) =>
        prev.map((comment) =>
          comment.commentNo === commentNo
            ? {
                ...comment,
                commentLiked: updatedLikeStatus,
                commentLike: updatedLikeStatus
                  ? comment.commentLike + 1
                  : comment.commentLike - 1,
              }
            : comment
        )
      );
    } catch (err) {
      alert("좋아요 처리 실패");
      console.error(err);
    }
  };

  // 트리 구조로 변환
  const buildCommentTree = (comments) => {
    const map = {};
    const roots = [];

    comments.forEach((comment) => {
      map[comment.commentNo] = { ...comment, children: [] };
    });

    comments.forEach((comment) => {
      if (comment.commentParentNo) {
        const parent = map[comment.commentParentNo];
        if (parent) parent.children.push(map[comment.commentNo]);
        else roots.push(map[comment.commentNo]); // 부모가 삭제된 경우도 포함
      } else {
        roots.push(map[comment.commentNo]);
      }
    });

    return roots;
  };

  // ✨ 댓글 렌더링
  const renderComment = (comment, parentDeleted = false) => {
    const isDeleted = comment.commentDelFl === "Y";

    if (isDeleted && comment.children.length === 0) {
      return null; // 삭제된 댓글이고 자식도 없으면 표시 안 함
    }

    return (
      <li key={comment.commentNo}>
        {!isDeleted && (
          <div className={`comment-item`}>
            <div className="comment-content-area">
              <div className="comment-header">
                <div className="comment-author-info">
                  <strong>{comment.memberNickname}</strong>
                  <span className="comment-date">{comment.commentDate}</span>
                  <button
                    className="report-btn"
                    onClick={() => handleReport(comment.commentNo)}
                  >
                    <img src="/report.svg" alt="신고 아이콘" />
                  </button>
                </div>
                {(isAdmin || comment.memberNo === loginMemberNo) &&
                  editingCommentNo !== comment.commentNo && (
                    <div className="comment-actions-right">
                      <button
                        onClick={() =>
                          startEditing(
                            comment.commentNo,
                            comment.commentContent
                          )
                        }
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleCommentDelete(comment.commentNo)}
                      >
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

              {editingCommentNo === comment.commentNo ? (
                <>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={3}
                    style={{ width: "100%", resize: "vertical" }}
                  />
                  <div>
                    <button onClick={() => saveEdit(comment.commentNo)}>
                      저장
                    </button>
                    <button onClick={cancelEdit}>취소</button>
                  </div>
                </>
              ) : (
                <p className="comment-text">{comment.commentContent}</p>
              )}

              {editingCommentNo !== comment.commentNo && (
                <>
                  <button
                    className={`comment-like-btn ${
                      comment.commentLiked ? "liked" : ""
                    }`}
                    onClick={() => handleCommentLike(comment.commentNo)}
                  >
                    <img src="/commentLike.svg" alt="좋아요 아이콘" />
                  </button>
                  <span>{comment.commentLike}</span>
                  <button onClick={() => handleReplyClick(comment.commentNo)}>
                    답글
                  </button>
                </>
              )}
              {replyTarget === comment.commentNo && (
                <form
                  onSubmit={(e) => handleReplySubmit(e, comment.commentNo)}
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
        )}

        {comment.children.length > 0 && (
          <ul className="reply-list">
            {comment.children.map((child) =>
              renderComment(child, isDeleted ? true : false)
            )}
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
      ) : (
        <ul>
          {commentTree.length > 0 ? (
            commentTree.map((comment) => renderComment(comment, false))
          ) : (
            <p style={{ textAlign: "center", padding: "20px", color: "#888" }}>
              작성된 댓글이 없습니다.
            </p>
          )}
        </ul>
      )}
    </section>
  );
};

export default CommentSection;
