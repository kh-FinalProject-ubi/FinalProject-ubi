import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite";
import useAuthStore from "../../stores/useAuthStore";
import WelfareFacilityModal from "./WelfareFacilityModal";
import Modal from "../../components/common/Modal";
import LocalBenefitModal from "./LocalBenefitModal";
import styles from "../../styles/board/InsertBoard.module.css";

const MyTownBoardWrite = () => {
  const { memberNo, regionCity, regionDistrict } = useAuthStore();
  const [boardTitle, setTitle] = useState("");
  const [boardContent, setContent] = useState("");
  const navigate = useNavigate();

  const [postTypeCheck, setPostTypeCheck] = useState("");
  const postTypeCheckOptions = ["자유", "자랑", "복지시설후기", "복지혜택후기"];
  const [starRating, setStarRating] = useState(0);

  const [hashtags, setHashtags] = useState("");
  const [parsedTags, setParsedTags] = useState([]);
  // 1. 상태 선언
  const [tagLimitMessage, setTagLimitMessage] = useState("");

  const handleHashtagChange = (e) => {
    setHashtags(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = hashtags.trim().replace(/^#/, "");
      if (!newTag) return;

      let messages = [];

      if (newTag.length < 2) {
        messages.push("두 글자 이상 입력해주세요.");
      }

      if (parsedTags.length >= 5) {
        messages.push("해시태그는 최대 5개까지 입력할 수 있습니다.");
      }

      if (parsedTags.includes(newTag)) return;

      if (messages.length > 0) {
        // <br>로 줄바꿈
        setTagLimitMessage(messages.join("<br/>"));
        return;
      }

      const updatedTags = [...parsedTags, newTag];
      setParsedTags(updatedTags);
      setHashtags("");
      setTagLimitMessage("");
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const newTags = parsedTags.filter((_, i) => i !== indexToRemove);
    setParsedTags(newTags);
    setHashtags(""); // ✅ 입력창에도 표시 안 되도록 바로 초기화
  };

  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [selectedFacilityName, setSelectedFacilityName] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");

  const [selectedWelfare, setSelectedWelfare] = useState(null);
  const [selectedWelfareName, setSelectedWelfareName] = useState("");
  const [selectedBenefitId, setSelectedBenefitId] = useState("");
  const [selectedWelfareCategory, setSelectedWelfareCategory] = useState("");

  const uploadedImagesRef = useRef([]);

  const handleSubmit = () => {
    const postType = postTypeCheck.trim();

    // ✅ 내용 체크: 텍스트와 이미지 둘 다 없으면 막기
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = boardContent;
    const textContent = tempDiv.textContent.trim();
    const hasImage = tempDiv.querySelector("img") !== null;

    if (!boardTitle.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (boardContent.length() > 2000) {
      alert("게시글 내용이 너무 깁니다.");
      return;
    }

    if (!textContent && !hasImage) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!postTypeCheck) {
      alert("작성유형을 선택해주세요.");
      return;
    }

    if (hashtags.trim() !== "" && !hashtags.trim().startsWith("#")) {
      alert("해시태그는 반드시 #으로 시작해야 합니다.");
      return;
    }

    if (
      (postTypeCheck === "복지시설후기" || postTypeCheck === "복지혜택후기") &&
      starRating === 0
    ) {
      alert("별점을 선택해주세요.");
      return;
    }

    const hashtagList = parsedTags;

    const imageList = uploadedImagesRef.current.map((url, index) => {
      const segments = url.split("/");
      return {
        imagePath: "/" + segments.slice(0, -1).join("/"),
        imageOrder: index,
        imageName: segments[segments.length - 1],
      };
    });

    fetch("/api/editboard/mytown/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardTitle,
        boardContent,
        memberNo,
        postType,
        hashtagList,
        starCount: starRating,
        imageList,
        regionCity,
        regionDistrict,

        facilityApiServiceId:
          postType === "복지시설후기" ? selectedFacility?.serviceId : null,
        facilityName:
          postType === "복지시설후기" ? selectedFacility?.name : null,
        facilityKindCd:
          postType === "복지시설후기" ? selectedFacility?.category : null,
        facilityAddress:
          postType === "복지시설후기" ? selectedFacility?.address : null,

        apiServiceId:
          postType === "복지혜택후기" ? selectedWelfare?.serviceId : null,
        welfareName: postType === "복지혜택후기" ? selectedWelfare?.name : null,
        welfareAgency:
          postType === "복지혜택후기" ? selectedWelfare?.agency : null,
        category: postType === "복지혜택후기" ? selectedWelfareCategory : null,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`서버 오류: ${res.status} \n${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.boardNo) {
          navigate(`/mytownBoard/${data.boardNo}`);
        } else {
          alert("작성에 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error("글쓰기 실패:", err.message);
        alert("서버 오류 발생. 콘솔 로그 확인");
      });
  };

  useEffect(() => {
    $("#summernote").summernote({
      height: 300,
      callbacks: {
        onChange: function (contents) {
          setContent(contents);
        },
        onImageUpload: function (files) {
          for (let i = 0; i < files.length; i++) {
            const formData = new FormData();
            formData.append("image", files[i]);

            fetch("/api/editboard/mytown/uploadImage", {
              method: "POST",
              body: formData,
            })
              .then((res) => res.text())
              .then((imageUrl) => {
                $("#summernote").summernote("insertImage", imageUrl);
                uploadedImagesRef.current.push(imageUrl);
              })
              .catch((err) => {
                alert("이미지 업로드 실패");
                console.error(err);
              });
          }
        },
      },
      toolbar: [
        ["style", ["bold", "italic", "underline"]],
        ["para", ["ul", "ol"]],
        ["insert", ["link", "picture"]],
        ["misc", ["undo", "redo"]],
      ],
    });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.pageHeaderContainer}>
        <div className={styles.subText}>우리 동네 좋아요</div>
        <div className={styles.titleRow}>
          <h2 className={styles.pageTitle}>게시글 작성</h2>
          <span className={styles.tagButton}>
            {regionCity} {regionDistrict}
          </span>
        </div>
      </div>
      {/* 작성 테이블 */}

      <div className={styles.filterBox}>
        <table className={styles.filterTable}>
          <tbody>
            <tr className={styles.filterRow}>
              <th className={styles.filterLabel}>게시판 유형</th>
              <td className={styles.filterContent}>
                {postTypeCheckOptions.map((type) => (
                  <div
                    key={type}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="postTypeCheck"
                        value={type}
                        checked={postTypeCheck === type}
                        onChange={(e) => setPostTypeCheck(e.target.value)}
                      />
                      {type}
                    </label>

                    {/* ✅ 복지시설 또는 복지혜택 후기일 경우 버튼 및 선택값 표시 */}
                    {postTypeCheck === type && (
                      <>
                        {type === "복지시설후기" && (
                          <>
                            <button
                              onClick={() => setShowFacilityModal(true)}
                              className={styles.tagButton}
                            >
                              복지시설 선택
                            </button>
                            {selectedFacilityName && (
                              <span style={{ fontWeight: "bold" }}>
                                선택: {selectedFacilityName}
                              </span>
                            )}
                          </>
                        )}

                        {type === "복지혜택후기" && (
                          <>
                            <button
                              onClick={() => setShowBenefitModal(true)}
                              className={styles.tagButton}
                            >
                              복지혜택 선택
                            </button>
                            {selectedWelfareName && (
                              <span style={{ fontWeight: "bold" }}>
                                선택: {selectedWelfareName}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </td>
            </tr>

            {(postTypeCheck === "복지시설후기" ||
              postTypeCheck === "복지혜택후기") && (
              <tr className={styles.filterRow}>
                <th className={styles.filterLabel}>별점</th>
                <td className={styles.filterContent}>
                  <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img
                        key={i}
                        src={
                          i <= starRating
                            ? "/icons/boardstar.svg"
                            : "/icons/boardnostar.svg"
                        }
                        alt="별점"
                        className={styles.iconStar}
                        onClick={() => setStarRating(i)}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            )}

            <tr className={styles.filterRow}>
              <th className={styles.filterLabel}>해시태그</th>
              <td className={styles.filterContent}>
                <div className={styles.tagInputWrapper}>
                  <input
                    type="text"
                    className={styles.titleInput}
                    placeholder="#해시태그 입력 후 Enter"
                    value={hashtags}
                    onChange={handleHashtagChange}
                    onKeyDown={handleKeyDown}
                  />
                  <div className={styles.tagPreviewWrapper}>
                    {parsedTags.map((tag, idx) => (
                      <span
                        key={idx}
                        className={`${styles.tagButton} ${
                          idx === parsedTags.length - 1 ? styles.tagPurple : ""
                        }`}
                      >
                        #{tag}
                        <button
                          type="button"
                          className={styles.tagRemoveBtn}
                          onClick={() => handleRemoveTag(idx)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {tagLimitMessage && (
        <div
          className={styles.tagWarning}
          dangerouslySetInnerHTML={{ __html: tagLimitMessage }}
        />
      )}

      <br />

      {/* 제목 입력 */}
      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={boardTitle}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.titleInput}
        />
      </div>
      <div id="summernote" />

      <div className={styles.buttonContainer}>
        <button onClick={() => navigate(-1)} className={styles.listButton}>
          목록
        </button>
        <button onClick={handleSubmit} className={styles.submitButton}>
          글쓰기 완료
        </button>
      </div>

      {showFacilityModal && (
        <Modal onClose={() => setShowFacilityModal(false)}>
          <WelfareFacilityModal
            city={regionCity}
            district={regionDistrict}
            onSelect={({ name, id, category, address }) => {
              setSelectedFacility({ serviceId: id, name, category, address });
              setSelectedFacilityName(name);
              setSelectedFacilityId(id);
              setShowFacilityModal(false);
            }}
            onClose={() => setShowFacilityModal(false)}
          />
        </Modal>
      )}
      {showBenefitModal && (
        <Modal onClose={() => setShowBenefitModal(false)}>
          <LocalBenefitModal
            isOpen={showBenefitModal}
            onClose={() => setShowBenefitModal(false)}
            onSelect={({ serviceId, name, agency, category }) => {
              setSelectedWelfare({ serviceId, name, agency, category });
              setSelectedWelfareName(name);
              setSelectedBenefitId(serviceId);
              setSelectedWelfareCategory(category);
              setShowBenefitModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default MyTownBoardWrite;
