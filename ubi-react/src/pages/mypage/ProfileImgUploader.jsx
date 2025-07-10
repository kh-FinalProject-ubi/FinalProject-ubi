import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "../../styles/mypage/ProfileImgUploader.css";

export default function ProfileImgUploader({ onSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // 🔹 업로드 중 UX 개선용
  const defaultImg = "/default-profile.png";

  const { token, memberImg, setAuth } = useAuthStore();
  console.log("토큰 상태:", token);

  // 🔹 persist 복원 후 렌더링
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    e.target.value = null;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }, []);

  // 🔹 메모리 누수 방지
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleRemoveImage = useCallback(async () => {
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
        setIsLoading(true);
        const res = await axios.delete("/api/myPage/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 200) {
          setAuth((prev) => ({
            ...prev,
            memberImg: null,
          }));

          onSave?.();
        }
      } catch (err) {
        console.error("프로필 이미지 삭제 실패", err);
        alert("프로필 이미지 삭제에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedFile, previewUrl, token, onSave, setAuth]);

  const handleSave = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
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

        setAuth((prev) => ({
          ...prev,
          memberImg: res.data,
        }));

        onSave?.();
      }
    } catch (error) {
      console.error(error);
      alert("프로필 이미지 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, token, onSave, setAuth]);

  // 🔹 렌더링 최적화
  const imageSrc = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (memberImg) return `http://localhost:8080${memberImg}`;
    return defaultImg;
  }, [previewUrl, memberImg]);

  // 🔹 persist 복원 전 렌더링 방지
  if (!isLoaded) return null;

  return (
    <div className="profile-wrapper">
      <div
        className="profile-image-wrapper"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={imageSrc} alt="프로필" className="profile-image-border" />
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
            disabled={isLoading}
          >
            ×
          </button>
        </div>
      </div>

      {selectedFile && (
        <button
          className="save-button"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "저장 중..." : "저장하기"}
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
