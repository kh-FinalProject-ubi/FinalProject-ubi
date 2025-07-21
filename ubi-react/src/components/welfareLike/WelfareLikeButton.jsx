import React, { useState } from "react";
import axios from "axios";
import useModalStore from "../../stores/useModalStore";

// city를 받아서 URL 결정
const getLikeUrl = (city) => {
  if (!city) return "/api/welfarefacility/like/seoul";

  if (city.includes("부산")) return "/api/welfarefacility/like/busan";
  if (city.includes("서울")) return "/api/welfarefacility/like/seoul";
  if (city.includes("제주")) return "/api/welfarefacility/like/jeju";
  if (city.includes("경기")) return "/api/welfarefacility/like/gyeonggi";
  if (city.includes("인천")) return "/api/welfarefacility/like/incheon";
  if (city.includes("강원")) return "/api/welfarefacility/like/gangwon";
  if (city.includes("광주")) return "/api/welfarefacility/like/gwangju";

  return "/api/welfarefacility/like/seoul"; // fallback
};

/**
 * 복지시설 찜 버튼 컴포넌트
 */
const WelfareLikeButton = ({
  token,
  facilityName,
  category,
  regionCity,
  regionDistrict,
  description,
  agency,
  apiUrl,
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

    const parsedCity = regionCity?.trim();
    const parsedDistrict = regionDistrict?.trim();

    console.log("📍 facilityName:", facilityName);
    console.log("📍 regionCity:", parsedCity);
    console.log("📍 regionDistrict:", parsedDistrict);
    console.log("📍 apiUrl:", apiUrl);

    try {
      if (liked) {
        // 찜 취소 요청
        await axios.delete(getLikeUrl(parsedCity), {
          headers: { Authorization: `Bearer ${token}` },
          data: { apiUrl },
        });
      } else {
        // 찜 등록 요청
        const payload = {
          facilityName,
          category,
          regionCity: parsedCity,
          regionDistrict: parsedDistrict,
          description,
          agency: agency ?? "정보 없음",
          imageProfile,
          lat,
          lng,
        };

        console.log("🔥 전송 payload:", payload);

        await axios.post(getLikeUrl(parsedCity), payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
