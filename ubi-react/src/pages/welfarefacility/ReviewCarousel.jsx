// 📁 src/components/welfarefacility/ReviewCarousel.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/board/Review.module.css";

export default function ReviewCarousel({ reviews }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  if (!Array.isArray(reviews) || reviews.length === 0) return null;

  const total = reviews.length;
  const currentReview = reviews[current];

  const {
    boardNo,
    boardTitle,
    boardContent,
    boardDate,
    starCount,
    memberImage,
    memberNickname,

  } = currentReview;

 
// ✅ 1. 이미지 src 추출 로직 추가
  const goToDetail = () => {
    navigate(`/mytownboard/${boardNo}`);
  };


const extractImageSources = (html) => {
  const imgTagRegex = /<img[^>]+src=["']([^"']+)["']/g;
  const srcList = [];
  let match;
  while ((match = imgTagRegex.exec(html)) !== null) {
    srcList.push(match[1]);
  }
  return srcList;
};

const inlineImages = extractImageSources(boardContent);

 
  

   return (

        <div className={styles.carouselWrapper}>
      <div className={styles.carouselHeader}>
        <span className={styles.commentTitle}>후기</span>
        <span className={styles.commentCount}>({total})</span>
      </div>
<div className={styles.reviewCarousel}>
  {total > 1 && (
    <button
      className={`${styles.carouselArrow} ${styles.left}`}
      onClick={() => setCurrent((prev) => (prev - 1 + total) % total)}
    >
      <img src="/icons/LeftArrow.svg" alt="이전" className={styles.arrowIcon} />
    </button>
  )}

  <div className={styles.reviewCard} onClick={goToDetail}>
    {/* 헤더 줄 수평 정렬 */}
    <div className={styles.reviewTopRow}>
      <div className={styles.profileWrapper}>
        <img
          src={memberImage || "/default-profile.png"}
          alt="프로필"
          onError={(e) => (e.currentTarget.src = "/default-profile.png")}
          className={styles.profileImg}
        />
        <div className={styles.reviewInfo}>
          <h4 className={styles.reviewTitle}>{boardTitle}</h4>
          <strong className={styles.nickname}>{memberNickname}</strong>
          
        </div>
      </div>

      <div className={styles.reviewStar}>
        {[1, 2, 3, 4, 5].map((i) => (
          <img
            key={i}
            src={i <= starCount ? "/icons/boardstar.svg" : "/icons/boardnostar.svg"}
            alt="별점"
            className={styles.iconStar}
          />
        ))}
      </div>
    </div>

    <div className={styles.reviewContentWrap}>
      <div className={styles.reviewTextOnly}>
        {boardContent.replace(/<[^>]*>?/gm, "").slice(0, 100)}...
      </div>

      <div className={styles.reviewDate}>
        {new Date(boardDate).toLocaleDateString()}{" "}
        {new Date(boardDate).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>

      <div className={styles.inlineImages}>
        {inlineImages.slice(0, 4).map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`본문 이미지 ${idx + 1}`}
            onError={(e) => (e.currentTarget.src = "/default-profile.png")}
            className={styles.inlineImage}
          />
        ))}
      </div>
    </div>
  </div>

  {total > 1 && (
    <button
      className={`${styles.carouselArrow} ${styles.right}`}
      onClick={() => setCurrent((prev) => (prev + 1) % total)}
    >
      <img src="/icons/RightArrow.svg" alt="다음" className={styles.arrowIcon} />
    </button>
  )}
</div>
      </div>
  );
}
