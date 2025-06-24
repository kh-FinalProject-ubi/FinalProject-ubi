import React from "react";
import "../styles/Carousel.css";
// carousel-wrapper / carousel-card 공통스타일 재사용

// 목업 데이터 (썸네일, 제목, 닉네임, 조회수)
const mockPosts = Array.from({ length: 10 }).map((_, idx) => ({
  id: idx,
  thumbnail: "https://placehold.co/260x160?text=Thumbnail", // 임시 이미지
  title: `자유 게시글 제목 예시 ${idx + 1}`,
  author: "작성자",
  views: 300 + idx * 7,
}));

const PopularPostCarousel = () => {
  return (
    <div className="carousel-wrapper">
      {mockPosts.map((post) => (
        <article key={post.id} className="carousel-card post-card">
          <img
            src={post.thumbnail}
            alt={`${post.title} 썸네일`}
            className="post-thumb"
          />

          <h4 className="post-title">{post.title}</h4>

          <div className="post-meta">
            <span>{post.author}</span>
            <span className="divider">·</span>
            <span>조회수 {post.views}</span>
          </div>
        </article>
      ))}
    </div>
  );
};

export default PopularPostCarousel;
