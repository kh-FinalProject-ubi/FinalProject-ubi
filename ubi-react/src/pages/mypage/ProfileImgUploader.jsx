import React, { useState, useEffect } from "react";
import axios from 'axios';
import useAuthStore from '../../stores/useAuthStore';
import "../../styles/mypage/ProfileImgUploader.css";

export default function ProfileImgUploader({ member, onSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const { token } = useAuthStore(); // Zustand에서 회원 정보 가져옴
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const defaultImg = "/default-thumbnail.png";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 저장 후 (선택 해제 시) URL 정리
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 실제 표시할 src
  const imageSrc = previewUrl || member?.profileImg || defaultImg;

  const handleRemoveImage = () => {
    setSelectedFile(null);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const res = await axios.post(
        "/api/myPage/profile",
        formData, // ✅ 두 번째 인자로 FormData
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Content-Type은 생략해야 axios가 boundary 포함해서 자동으로 채움
          },
        }
      );

      if (res.status === 200) {
        const newImageUrl = res.data;  // 여기 경로 받기
        onSave(newImageUrl);
        setSelectedFile(null);
      }

    } catch (error) {
      console.error(error);
      alert("프로필 이미지 저장에 실패했습니다.");
    }
  };

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