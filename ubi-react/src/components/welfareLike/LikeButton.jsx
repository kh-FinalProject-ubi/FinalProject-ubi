import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // 로그인 리디렉션용

const LikeButton = ({
  apiServiceId,
  serviceName,
  category,
  regionCity,
  regionDistrict,
  token,
}) => {
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();

  const handleClick = async () => {
    if (!token) {
      const goLogin = window.confirm(
        "로그인이 필요한 기능입니다. 로그인하시겠습니까?"
      );
      if (goLogin) {
        navigate("/login"); // 또는 "/oauth2/authorization/kakao" 직접 이동도 가능
      }
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
            regionDistrict,
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
