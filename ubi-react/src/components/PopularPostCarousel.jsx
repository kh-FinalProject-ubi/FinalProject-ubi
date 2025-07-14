import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Carousel.module.css";

const PopularPostCarousel = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/board/mytownBoard")
      .then((res) => res.json())
      .then((data) => {
        console.log("📦 게시글 응답:", data);

        const rawList = Array.isArray(data.boardList) ? data.boardList : [];

        const sorted = rawList
          .sort((a, b) => b.boardReadCount - a.boardReadCount)
          .slice(0, 10);

        setPosts(sorted);
      })
      .catch((err) => console.error("🔥 인기 게시글 로딩 실패:", err));
  }, []);

  return (
//   <div className="carousel-wrapper">
//     {posts.map((board) => (
//       <article key={board.boardNo} className="carousel-card post-card">
//         <Link to={`/mytownBoard/${board.boardNo}`}>
//           <img
//             src={
//               board.thumbnail
//                 ? board.thumbnail.replace(/\/{2,}/g, "/")
//                 : "/default-thumbnail.png"
//             }
//             alt={`${board.boardTitle} 썸네일`}
//             className="post-thumb"
//             onError={(e) => {
//               e.target.onerror = null;
//               e.target.src = "/default-thumbnail.png";
//             }}
//           />
//         </Link>

//         <h4 className="post-title">{board.boardTitle}</h4>

//         <div className="post-meta">
//           <img
//             src={board.memberImg || "/default-profile.png"}
//             alt="프로필"
//             width="24"
//             height="24"
//             style={{ borderRadius: "50%", marginRight: "6px" }}
//           />
//           <span>{board.memberNickname}</span>
//           <span className="divider">·</span>
//           <span>조회수 {board.boardReadCount}</span>
//         </div>
//       </article>
//     ))}
//   </div>
// );
// };

// export default PopularPostCarousel;

    <div className={styles.carouselWrapper}>
      {posts.map((post) => (
        <article
          key={post.boardNo}
          className={`${styles.carouselCard} ${styles.postCard}`}
        >
          <Link to={`/mytownBoard/${post.boardNo}`}>
          <img
            src={
              board.thumbnail
                ? board.thumbnail.replace(/\/{2,}/g, "/")
                : "/default-thumbnail.png"
            }
            alt={`${board.boardTitle} 썸네일`}
            className="post-thumb"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/default-thumbnail.png";
            }}
          />
          </Link>

          <h4 className={styles.postTitle}>{post.boardTitle}</h4>

          <div className={styles.postMeta}>
            <img
              src={post.memberImg || "/default-profile.png"}
              alt="프로필"
              width="24"
              height="24"
              style={{ borderRadius: "50%", marginRight: "6px" }}
            />
            <span>{post.memberNickname}</span>
            <span className={styles.divider}>·</span>
            <span>조회수 {post.boardReadCount}</span>
          </div>
        </article>
      ))}
    </div>
  );
};
export default PopularPostCarousel;
