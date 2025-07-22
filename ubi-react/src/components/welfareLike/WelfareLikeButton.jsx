import { useEffect, useState } from "react";
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

  // ✅ 페이지 로딩 시 찜 상태 확인
  useEffect(() => {
    if (token && facilityName && regionCity && regionDistrict) {
      axios
        .get("/api/welfarefacility/like/check", {
          params: {
            facilityName: encodeURIComponent(facilityName), // ← 추가
            regionCity: encodeURIComponent(regionCity),
            regionDistrict: encodeURIComponent(regionDistrict),
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setLiked(res.data); // true면 💖, false면 🤍
        })
        .catch((err) => {
          console.error("찜 상태 확인 실패", err);
        });
    }
  }, [token, facilityName, regionCity, regionDistrict]);

  const handleClick = async (e) => {
    e.stopPropagation(); // ✅ 카드 클릭 막기

    // ✅ 로그인 여부 확인
    if (!token) {
      const goLogin = window.confirm(
        "로그인이 필요한 기능입니다. 로그인하시겠습니까?"
      );
      if (goLogin) openLoginModal();
      return;
    }

    const parsedCity = regionCity?.trim() || "";
    const parsedDistrict = regionDistrict?.trim() || "";

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

    try {
      console.log("🔥 찜 요청 payload:", payload);

      const url = getLikeUrl(parsedCity);
      console.log("📡 요청 URL:", url);

      await axios.post(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ 찜 상태 토글 (현재 상태 반영)
      setLiked((prev) => !prev);
    } catch (err) {
      console.error("❌ 찜 처리 실패", err);
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
        padding: "3px 8px",

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

export default WelfareLikeButton;
