import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/board/MyTownBoardList.module.css"; // ✅ 기존 게시글 스타일 재사용
import { generateTagList } from "../utils/tagUtils";

function PopularPostList() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
 fetch("/api/board/mytownBoard?page=1")
      .then((res) => res.json())
      .then((data) => {
        const rawList = Array.isArray(data.boardList) ? data.boardList : [];
        const sorted = rawList
          .sort((a, b) => b.boardReadCount - a.boardReadCount)
          .slice(0, 8);
        setPosts(sorted);
      })
      .catch((err) => console.error("🔥 인기 게시글 로딩 실패:", err));
  }, []);

  return (
    <div className={styles.boardGrid}>
      {posts.map((board) => (
        <Link
          to={`/mytownBoard/${board.boardNo}`}
          key={board.boardNo}
          className={styles.boardCard}
        >
          <div className={styles.thumbnailWrapper}>
            <img
              className={styles.thumbnail}
              src={
                board.thumbnail?.replace(/\/{2,}/g, "/") ||
                "/default-thumbnail.png"
              }
              alt="썸네일"
              onError={(e) => {
                e.currentTarget.src = "/default-thumbnail.png";
                e.currentTarget.onerror = null;
              }}
            />
          </div>
          <div className={styles.cardContent}>
            <h3 className={styles.cardTitle}>{board.boardTitle}</h3>
            <div className={styles.tagContainer}>
              {renderLimitedTags(generateTagList(board), 4)}
            </div>
            <p className={styles.cardText}>{stripHtml(board.boardContent)}</p>
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {(board.postType === "복지혜택후기" || board.postType === "복지시설후기") &&
                  [1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      src={
                        i <= board.starCount
                          ? "/icons/boardstar.svg"
                          : "/icons/boardnostar.svg"
                      }
                      alt="별점"
                      className={styles.iconStar}
                    />
                  ))}
              </div>
              <span className={styles.dateText}>{board.boardDate}</span>
            </div>
            <div className={styles.metaRow}>
              <div className={styles.userInfo}>
                <img
                  className={styles.profileImg}
                  src={board.memberImg || "/default-profile.png"}
                  alt="프로필"
                />
                <span>{board.memberNickname}</span>
              </div>
              <div className={styles.iconInfo}>
                <img
                  src="/icons/boardlike.svg"
                  alt="좋아요"
                  className={styles.iconHeart}
                />
                <span>{board.likeCount}</span>
                <span>조회 {board.boardReadCount}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default PopularPostList;

function stripHtml(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function renderLimitedTags(tags, maxDisplay = 4) {
  const visibleTags = tags.slice(0, maxDisplay);
  const hasOverflow = tags.length > maxDisplay;

  return (
    <>
      {visibleTags.map((tag, idx) => (
        <span
          key={idx}
          className={`${styles.tag} ${
            idx === 0
              ? styles.tagYellow
              : idx === 1
              ? styles.tagPurple
              : styles.tagWhite
          }`}
        >
          #{tag}
        </span>
      ))}
      {hasOverflow && <span className={styles.tagEllipsis}>...</span>}
    </>
  );
}
