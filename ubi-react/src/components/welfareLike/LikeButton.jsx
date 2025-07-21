import React, { useState } from "react";
import axios from "axios";
import useModalStore from "../../stores/useModalStore";

// 🔧 apiServiceId 정규화 유틸 함수
const getNormalizedApiServiceId = (id) => {
  if (!id) return null;
  if (
    id.startsWith("bokjiro-") ||
    id.startsWith("seoul-") ||
    id.startsWith("job-API1-") ||
    id.startsWith("job-API2-")
  ) {
    return id;
  }
  if (id.startsWith("WLF")) return `bokjiro-${id}`;
  if (id.startsWith("S")) return `seoul-${id}`;
  if (!isNaN(id)) return `job-API2-${id}`;
  return id;
};

const LikeButton = ({
  token,
  apiServiceId,
  serviceName,
  category,
  regionCity,
  regionDistrict,
  description,
  agency,
  url,
  receptionStart,
  receptionEnd,
  imageProfile,
  lat,
  lng,
}) => {
  const [liked, setLiked] = useState(false);
  const { openLoginModal } = useModalStore();

  const handleClick = async () => {
    if (!token) {
      const goLogin = window.confirm(
        "로그인이 필요한 기능입니다. 로그인하시겠습니까?"
      );
      if (goLogin) openLoginModal();
      return;
    }

    const normalizedId = getNormalizedApiServiceId(apiServiceId);

    try {
      if (liked) {
        await axios.delete("/api/welfare/like", {
          headers: { Authorization: `Bearer ${token}` },
          data: { apiServiceId: normalizedId },
        });
      } else {
        await axios.post(
          "/api/welfare/like",
          {
            apiServiceId: normalizedId,
            serviceName,
            category,
            regionCity,
            regionDistrict: regionDistrict || "제한없음",
            description,
            agency: agency ?? "정보 없음",
            url,
            receptionStart,
            receptionEnd,
            imageProfile,
            lat,
            lng,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setLiked(!liked);
    } catch (err) {
      console.error("찜 처리 실패", err);
      alert("찜 처리에 실패했습니다.");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        backgroundColor: liked ? "#FFE56D" : "#ffffff",
        color: liked ? "#2E2E2E" : "#5E60CE",
        border: `2px solid ${liked ? "#FFE56D" : "#5E60CE"}`,
        borderRadius: "24px",
        padding: "8px 16px",
        fontWeight: "bold",
        fontSize: "15px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: liked
          ? "0 2px 6px rgba(255, 229, 109, 0.4)"
          : "0 2px 6px rgba(94, 96, 206, 0.3)",
      }}
    >
      {liked ? "💖 찜 취소" : "🤍 찜하기"}
    </button>
  );
};

export default LikeButton;
