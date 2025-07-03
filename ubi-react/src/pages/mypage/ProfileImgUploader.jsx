import React, { useState } from "react";
import "../../styles/mypage/ProfileImgUploader.css";

export default function ProfileImgUploader({ member, onSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const defaultImg = "/default-thumbnail.png";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("선택된 파일:", file);
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("읽은 파일 데이터:", reader.result);
      setSelectedFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
  };

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      // 서버에 이미지 업로드 요청 (예: base64 대신 FormData)
      const formData = new FormData();
      formData.append("profileImage", dataURLtoFile(selectedFile, "profile.png"));

      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("업로드 실패");

      const result = await res.json();

      // 업로드 후 응답에서 이미지 URL 받아서 부모에 알림
      onSave(result.imageUrl);

      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      alert("프로필 이미지 저장에 실패했습니다.");
    }
  };

  const imageSrc = selectedFile || member?.profileImg || defaultImg;

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