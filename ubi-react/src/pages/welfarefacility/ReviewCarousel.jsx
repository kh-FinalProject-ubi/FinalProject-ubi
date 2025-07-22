// 📁 src/components/welfarefacility/ReviewCarousel.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/board/Review.module.css";

export default function ReviewCarousel({ reviews }) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  if (!Array.isArray(reviews) || reviews.length === 0) return (
      <section className={styles.carouselWrapper}>
        <div className={styles.reviewHeaderRow}>
          <span className={styles.commentTitle}>후기</span>
          <span className={styles.commentCount}>(0)</span>
        </div>
        <hr />
  
        <div className={styles.reviewCarousel}>
          <div className={styles.noReviewMessage}>
            작성된 후기가 없습니다.
          </div>
        </div>
      </section>
    );
  
  const total = reviews.length;
  const currentReview = reviews[current];

  const {
    boardNo,
    boardTitle,
    boardContent,
    boardDate,
    starCount,
    memberImg,
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
    <div className={styles.reviewHeaderRow}>
      <span className={styles.commentTitle}>후기</span>
      <span className={styles.commentCount}>({total})</span>
    </div>
    <hr />

    <div className={styles.reviewCarousel}>
      {/* 데스크탑용 화살표 - 왼쪽 */}
      {total > 1 && (
        <div className={styles.desktopArrows}>
          <button
            className={`${styles.carouselArrow} ${styles.left}`}
            onClick={() => setCurrent((prev) => (prev - 1 + total) % total)}
          >
            <img
              src="/icons/LeftArrow.svg"
              alt="이전"
              className={styles.arrowIcon}
            />
          </button>
        </div>
      )}

      {/* 후기 카드 */}
      <div className={styles.reviewCard} onClick={goToDetail}>
        <div className={styles.reviewRow}>
          {/* 프로필 이미지 */}
          <img
            className={styles.profileImg}
            src={memberImg || "/default-profile.png"}
            alt="프로필"
            onError={(e) => {
              e.currentTarget.src = "/default-profileerror.png";
              e.currentTarget.onerror = null;
            }}
          />

          {/* 후기 내용 */}
          <div className={styles.reviewCol}>
            <div className={styles.reviewTop}>
              <h4 className={styles.reviewTitle}>{boardTitle}</h4>
              <div className={styles.reviewStar}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <img
                    key={i}
                    src={
                      i <= starCount
                        ? "/icons/boardstar.svg"
                        : "/icons/boardnostar.svg"
                    }
                    alt="별점"
                    className={styles.iconStar}
                  />
                ))}
              </div>
            </div>

            <div className={styles.nickname}>{memberNickname}</div>

            <div className={styles.reviewDate}>
              {new Date(boardDate).toLocaleDateString()}{" "}
              {new Date(boardDate).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className={styles.reviewTextOnly}>
              {boardContent.replace(/<[^>]*>?/gm, "").slice(0, 100)}...
            </div>

            <div className={styles.inlineImages}>
              <div className={styles.imageRow}>
                {inlineImages.slice(0, 4).map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`본문 이미지 ${idx + 1}`}
                    onError={(e) =>
                      (e.currentTarget.src = "/default-profile.png")
                    }
                    className={styles.inlineImage}
                  />
                ))}

                {inlineImages.length > 4 && (
                  <div className={styles.moreImageCircle}>
                    +{inlineImages.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크탑용 화살표 - 오른쪽 */}
      {total > 1 && (
        <div className={styles.desktopArrows}>
          <button
            className={`${styles.carouselArrow} ${styles.right}`}
            onClick={() => setCurrent((prev) => (prev + 1) % total)}
          >
            <img
              src="/icons/RightArrow.svg"
              alt="다음"
              className={styles.arrowIcon}
            />
          </button>
        </div>
      )}
    </div>

    {/* 모바일용 화살표 - 후기 카드 아래쪽 중앙 */}
    {total > 1 && (
      <div className={styles.arrowBottomWrapper}>
        <button
          className={styles.carouselArrow}
          onClick={() => setCurrent((prev) => (prev - 1 + total) % total)}
        >
          <img
            src="/icons/LeftArrow.svg"
            alt="이전"
            className={styles.arrowIcon}
          />
        </button>
        <button
          className={styles.carouselArrow}
          onClick={() => setCurrent((prev) => (prev + 1) % total)}
        >
          <img
            src="/icons/RightArrow.svg"
            alt="다음"
            className={styles.arrowIcon}
          />
        </button>
      </div>
    )}
  </div>
);

}
