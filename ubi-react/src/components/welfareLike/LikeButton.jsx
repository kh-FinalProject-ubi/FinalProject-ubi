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
            agency,
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
    <button onClick={handleClick}>{liked ? "💖 찜 취소" : "🤍 찜하기"}</button>
  );
};

export default LikeButton;
