import React, { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "../../styles/mypage/ProfileImgUploader.css";

export default function ProfileImgUploader({ onSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const { token, memberImg, setAuth } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const defaultImg = "/default-profile.png";

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // hydration 될 때 렌더링 시작
    setIsLoaded(true);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = null;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleRemoveImage = async () => {
    if (selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      const confirmed = window.confirm("기본 프로필로 변경하시겠습니까?");
      if (!confirmed) return;

      try {
        const res = await axios.delete("/api/myPage/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          setAuth({
            ...useAuthStore.getState(),
            memberImg: null,
          });

          onSave && onSave();
        }
      } catch (err) {
        console.error("프로필 이미지 삭제 실패", err);
        alert("프로필 이미지 삭제에 실패했습니다.");
      }
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const res = await axios.post("/api/myPage/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setSelectedFile(null);
        setPreviewUrl(null);

        setAuth({
          ...useAuthStore.getState(),
          memberImg: res.data,
        });

        onSave && onSave();
      }
    } catch (error) {
      console.error(error);
      alert("프로필 이미지 저장에 실패했습니다.");
    }
  };

  const imageSrc = previewUrl
    ? previewUrl
    : memberImg
    ? `http://localhost:8080${memberImg}`
    : defaultImg;

  // 🚩 persist 복원이 되기 전에는 렌더링하지 않음
  if (!isLoaded) return null;

  return (
    <div className="profile-wrapper">
      <div
        className="profile-image-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={imageSrc}
          alt="프로필"
          className="profile-image-border"
        />
        <img
          src={imageSrc}
          alt="프로필 흐림"
          className={`profile-image-blur ${isHovered ? "active" : ""}`}
        />
        <div className={`buttons-container ${isHovered ? "visible" : ""}`}>
          <label htmlFor="profileInput" className="change-label">
            변경하기
          </label>
          <button
            type="button"
            className="remove-button"
            onClick={handleRemoveImage}
          >
            ×
          </button>
        </div>
      </div>

      {selectedFile && (
        <button className="save-button" onClick={handleSave}>
          저장하기
        </button>
      )}

      <input
        id="profileInput"
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageChange}
      />
    </div>
  );
}
