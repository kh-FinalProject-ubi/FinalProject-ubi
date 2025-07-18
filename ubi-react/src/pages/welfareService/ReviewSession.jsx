import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
      <section className="facility-section">
        <h3>📰 이 복지혜택과 관련된 게시글</h3>
        <p style={{ color: "#666", fontStyle: "italic" }}>관련 후기가 없습니다.</p>
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
    const match = content?.match(/<img[^>]+src="([^"]+)"[^>]*>/i);
    return match?.[1] || null;
  };

  const firstInlineImage = extractFirstImage(boardContent);

  const goToDetail = () => {
    navigate(`/mytownboard/${boardNo}`);
  };

  return (
    <section className="facility-section">
      <h3>📰 이 복지혜택과 관련된 게시글</h3>
      <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
        총 {reviews.length}건의 후기
      </p>

      <div className="review-carousel">
        {reviews.length > 1 && (
          <button className="carousel-arrow left" onClick={() => setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length)}>
            ◀
          </button>
        )}

        <div className="review-card" onClick={goToDetail}>
          <div className="review-header">
            <img
              src={profileImage || "/default-profile.png"}
              alt="프로필"
              className="profile-img"
            />
            <div className="review-info">
              <strong>{memberNickname}</strong>
              <span className="review-date">
                {new Date(boardDate).toLocaleDateString()}
              </span>
            </div>
            <div className="review-star">⭐ {starCount}</div>
          </div>

          <h4 className="review-title">{boardTitle}</h4>
          <p
            className="review-content"
            dangerouslySetInnerHTML={{
              __html: boardContent.length > 100
                ? boardContent.slice(0, 100) + "..."
                : boardContent,
            }}
          />

          <div
            className="review-images"
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "10px",
              flexWrap: "nowrap",
              alignItems: "center",
            }}
          >
            {imageListSafe.length > 0 &&
              imageListSafe.slice(0, 3).map((img, i) => (
                <img
                  key={i}
                  src={img.imagePath}
                  alt={`첨부 이미지 ${i + 1}`}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ))}

            {imageListSafe.length === 0 && firstInlineImage && (
              <img
                src={firstInlineImage}
                alt="본문 이미지"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            )}

            {imageListSafe.length > 3 && (
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "80px",
                  minWidth: "50px",
                }}
              >
                +{imageListSafe.length - 3}
              </div>
            )}
          </div>
        </div>

        {reviews.length > 1 && (
          <button className="carousel-arrow right" onClick={() => setCurrent((prev) => (prev + 1) % reviews.length)}>
            ▶
          </button>
        )}
      </div>
    </section>
  );
}
