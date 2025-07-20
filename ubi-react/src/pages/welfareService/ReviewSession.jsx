import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../../styles/board/Review.module.css";
export default function WelfareReviewSection({ apiServiceId }) {
  const [reviews, setReviews] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!apiServiceId) return;

    axios
      .get(`/api/board/mytownBoard/welfare/${apiServiceId}`)
      .then((res) => {
        setReviews(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("후기를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, [apiServiceId]);

  if (loading) return null;

  if (!reviews || reviews.length === 0) {
    return (
      <section className={styles.carouselWrapper}>
        <h3>📰 이 복지혜택과 관련된 게시글</h3>
        <p style={{ color: "#666", fontStyle: "italic" }}>
          관련 후기가 없습니다.
        </p>
      </section>
    );
  }

  const {
    boardNo,
    boardTitle,
    boardContent,
    boardDate,
    starCount,
    profileImage,
    memberNickname,
    imageList,
  } = reviews[current];

  const imageListSafe = Array.isArray(imageList) ? imageList : [];

  const extractFirstImage = (content) => {
    const match = content?.match(/<img[^>]+src=\"([^\"]+)\"[^>]*>/i);
    return match?.[1] || null;
  };

  const firstInlineImage = extractFirstImage(boardContent);

  const goToDetail = () => {
    navigate(`/mytownboard/${boardNo}`);
  };

  return (
    <section className={styles.carouselWrapper}>
      <div className={styles.reviewHeaderRow}>
        <span className={styles.commentTitle}>후기</span>
        <span className={styles.commentCount}>({reviews.length})</span>
      </div>
      <hr />

      <div className={styles.reviewCarousel}>
        {reviews.length > 1 && (
          <button
            className={`${styles.carouselArrow} ${styles.left}`}
            onClick={() =>
              setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length)
            }
          >
            <img
              src="/icons/LeftArrow.svg"
              alt="이전"
              className={styles.arrowIcon}
            />
          </button>
        )}

        <div className={styles.reviewCard} onClick={goToDetail}>
          <div className={styles.reviewRow}>
            <img
              src={profileImage || "/default-profile.png"}
              alt="프로필"
              className={styles.profileImg}
              onError={(e) => (e.currentTarget.src = "/default-profile.png")}
            />

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
                  {imageListSafe.slice(0, 4).map((src, idx) => (
                    <img
                      key={idx}
                      src={src.imagePath}
                      alt={`본문 이미지 ${idx + 1}`}
                      onError={(e) =>
                        (e.currentTarget.src = "/default-profile.png")
                      }
                      className={styles.inlineImage}
                    />
                  ))}

                  {imageListSafe.length === 0 && firstInlineImage && (
                    <img
                      src={firstInlineImage}
                      alt="본문 이미지"
                      className={styles.inlineImage}
                    />
                  )}

                  {imageListSafe.length > 4 && (
                    <div className={styles.moreImageCircle}>
                      +{imageListSafe.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {reviews.length > 1 && (
          <button
            className={`${styles.carouselArrow} ${styles.right}`}
            onClick={() => setCurrent((prev) => (prev + 1) % reviews.length)}
          >
            <img
              src="/icons/RightArrow.svg"
              alt="다음"
              className={styles.arrowIcon}
            />
          </button>
        )}
      </div>
    </section>
  );
}
