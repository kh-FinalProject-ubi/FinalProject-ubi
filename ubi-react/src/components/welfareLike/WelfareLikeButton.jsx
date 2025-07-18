import React, { useState } from "react";
import axios from "axios";
import useModalStore from "../../stores/useModalStore";

/**
 * 복지시설 찜 버튼 컴포넌트
 * - 복지 API는 서비스 ID 대신 시설 고유 URL을 식별자로 사용
 */
const WelfareLikeButton = ({
  token,
  facilityName,
  category,
  regionCity,
  regionDistrict,
  description,
  agency,
  apiUrl, // ✅ 고유 식별자로 사용하는 필드
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
          data: { apiUrl }, // ✅ 고유 식별자
        });
      } else {
        await axios.post(
          "/api/welfare/like",
          {
            apiUrl,
            facilityName,
            category,
            regionCity,
            regionDistrict: regionDistrict || "제한없음",
            description,
            agency: agency ?? "정보 없음",
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

export default WelfareLikeButton;
