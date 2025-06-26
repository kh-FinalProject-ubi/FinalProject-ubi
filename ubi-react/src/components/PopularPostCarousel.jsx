import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Carousel.css";

const PopularPostCarousel = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("/api/board/mytownBoard")
      .then((res) => res.json())
      .then((data) => {
        const sorted = [...data]
          .sort((a, b) => b.boardReadCount - a.boardReadCount)
          .slice(0, 10);
        setPosts(sorted);
      })
      .catch((err) => console.error("🔥 인기 게시글 로딩 실패:", err));
  }, []);

  if (posts.length === 0) return null;

  return (
    <div className="carousel-wrapper">
      {posts.map((post) => (
        <article key={post.boardNo} className="carousel-card post-card">
          <Link to={`/mytownBoard/${post.boardNo}`}>
            <img
              src={post.thumbnail || "/default-thumbnail.png"}
              alt={`${post.boardTitle} 썸네일`}
              className="post-thumb"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-thumbnail.png";
              }}
            />
          </Link>

          <h4 className="post-title">{post.boardTitle}</h4>

          <div className="post-meta">
            <img
              src={post.memberImg || "/default-profile.png"}
              alt="프로필"
              width="24"
              height="24"
              style={{ borderRadius: "50%", marginRight: "6px" }}
            />
            <span>{post.memberNickname}</span>
            <span className="divider">·</span>
            <span>조회수 {post.boardReadCount}</span>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PopularPostCarousel;
