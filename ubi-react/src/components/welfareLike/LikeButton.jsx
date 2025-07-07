import React, { useState } from "react";
import axios from "axios";
import useModalStore from "../../stores/useModalStore";

const LikeButton = ({
  token,
  // ✅ 필수 props
  apiServiceId,
  serviceName,
  category,
  regionCity,
  regionDistrict,
  // ✅ 추가 props (상세 내용)
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

    try {
      if (liked) {
        await axios.delete("/api/welfare/like", {
          headers: { Authorization: `Bearer ${token}` },
          data: { apiServiceId },
        });
      } else {
        await axios.post(
          "/api/welfare/like",
          {
            apiServiceId,
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
