import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/mypage/ProfileImgUploader.module.css";

export default function ProfileImgUploader({ onSave }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const defaultImg = "/default-profile.png";
  const currentAuth = useAuthStore.getState();
  const { token, memberImg, setAuth } = useAuthStore();

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
          setAuth({
            ...currentAuth,
            memberImg: res.data,
          });
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
        setAuth({
          ...currentAuth,
          memberImg: null,
        });
        onSave?.();
      }
    } catch (error) {
      console.error(error);
      alert("프로필 이미지 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, token, onSave, setAuth]);

  const imageSrc = useMemo(() => {
    if (previewUrl) return previewUrl;
    if (memberImg) return `https://kh-ubi.site${memberImg}`;
    return defaultImg;
  }, [previewUrl, memberImg]);

  if (!isLoaded) return null;

  return (
    <div className={styles.profileWrapper}>
      <div
        className={styles.profileImageWrapper}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ⬇ 이 div 가 ‘마스크’ 역할 */}
        <div className={styles.imageMask}>
          <img
            src={imageSrc}
            alt="프로필"
            className={styles.profileImageBorder}
          />
          <img
            src={imageSrc}
            alt="프로필 흐림"
            className={`${styles.profileImageBlur} ${
              isHovered ? styles.active : ""
            }`}
          />
        </div>

        {/* 버튼은 마스크 밖이라 잘리지 않음 */}
        <div
          className={`${styles.buttonsContainer} ${
            isHovered ? styles.visible : ""
          }`}
        >
          <label htmlFor="profileInput" className={styles.changeLabel}>
            변경하기
          </label>
          <button
            type="button"
            className={styles.removeButton}
            onClick={handleRemoveImage}
            disabled={isLoading}
          >
            ×
          </button>
        </div>
      </div>

      {selectedFile && (
        <button
          className={styles.saveButton}
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
