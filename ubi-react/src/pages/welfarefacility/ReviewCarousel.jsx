// 📁 src/components/welfarefacility/ReviewCarousel.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


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
    profileImage,
    memberNickname,
    imageList,
  } = currentReview;

  const imageListSafe = Array.isArray(imageList) ? imageList : [];

  const goToDetail = () => {
    navigate(`/mytownboard/${boardNo}`);
  };

  const extractFirstImageFromContent = (content) => {
    const imgTagRegex = /<img[^>]+src="([^"]+)"[^>]*>/i;
    const match = content?.match(imgTagRegex);
    return match?.[1] || null;
  };

  const firstInlineImage = extractFirstImageFromContent(boardContent);

  return (
    <div className="review-carousel">
      {total > 1 && (
        <button
          className="carousel-arrow left"
          onClick={() => setCurrent((prev) => (prev - 1 + total) % total)}
        >
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
            __html:
              boardContent.length > 100
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
  {/* ✅ 첨부 이미지가 1개 이상 있는 경우 */}
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

  {/* ✅ 첨부 이미지가 없고 본문에 이미지가 있을 경우 */}
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

  {/* ✅ 초과 이미지 개수 표시 */}
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

      {total > 1 && (
        <button
          className="carousel-arrow right"
          onClick={() => setCurrent((prev) => (prev + 1) % total)}
        >
          ▶
        </button>
      )}
    </div>
  );
}
