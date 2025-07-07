import React, { useState, useEffect } from "react";
import axios from 'axios';
import useAuthStore from '../../stores/useAuthStore';
import "../../styles/mypage/ProfileImgUploader.css";

export default function ProfileImgUploader({ member, onSave }) {

  console.log("ProfileImgUploader member prop:", member);
  console.log("member.memberImg:", member?.memberImg);

  const [isHovered, setIsHovered] = useState(false);
  const { token } = useAuthStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentImage, setCurrentImage] = useState(member?.profileImg);

  const defaultImg = "/default-profile.png";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    
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

  const handleRemoveImage = () => {
    if (selectedFile) {
      // 프리뷰만 제거 (3번 상태)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
    } else {
      const confirmed = window.confirm("기본 프로필로 변경하시겠습니까?");
        if (!confirmed) {
          return; // 취소 누르면 함수 종료
      }
      // 저장된 이미지 제거 (2번 상태)
      setCurrentImage(null);
      const { setAuth, ...rest } = useAuthStore.getState();
        setAuth({
          ...rest,
          memberImg: null,
        });
      onSave && onSave(); // 혹시 부모에서 상태 동기화 필요하면 호출
    }
  };

  const imageSrc = previewUrl
    ? previewUrl
    : currentImage
      ? `http://localhost:8080${currentImage}`
      : defaultImg;
  // console.log("이미지 경로 : " + imageSrc);

  const handleSave = async () => {
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedFile);

      const res = await axios.post(
        "/api/myPage/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 200) {
        console.log(res.data);

        // 서버에서 변경된 경로 res.data로 내려준다고 가정
        setCurrentImage(res.data);

        setSelectedFile(null);
        setPreviewUrl(null);

        onSave && onSave();

        const { setAuth, ...rest } = useAuthStore.getState();
        setAuth({
          ...rest,
          memberImg: res.data,
        });
      }
    } catch (error) {
      console.error(error);
      alert("프로필 이미지 저장에 실패했습니다.");
    }
  };

  useEffect(() => {
    if (member?.profileImg) {
      setCurrentImage(member.profileImg);
    }
  }, [member?.profileImg]);

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
