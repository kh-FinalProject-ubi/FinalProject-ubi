import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite.js";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/board/InsertBoard.module.css";

function MytownBoardUpdate() {
  const { boardNo } = useParams();
  const { token } = useAuthStore();
  const { regionCity, regionDistrict } = useAuthStore();
  const [board, setBoard] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardContent, setBoardContent] = useState("");
  const uploadedImagesRef = useRef([]);
  const navigate = useNavigate();
  const isInitialSet = useRef(true);


  const [hashtags, setHashtags] = useState("");
  const [parsedTags, setParsedTags] = useState([]);
  const [tagLimitMessage, setTagLimitMessage] = useState("");;
  const [initialParsed, setInitialParsed] = useState(false);

  
  // ✅ 기존 DB에서 불러온 해시태그를 parsedTags로만 세팅하고 input엔 안 보이게 유지
  useEffect(() => {
    if (!initialParsed && board) {
      const tagsFromList = Array.isArray(board.hashtagList)
        ? board.hashtagList
        : typeof board.hashtags === "string"
        ? board.hashtags.split(",").map((t) => t.trim())
        : [];

      if (tagsFromList.length > 0) {
        setParsedTags(tagsFromList);
        setInitialParsed(true);
        setHashtags("");
      }
    }
  }, [board, initialParsed]);


  const handleHashtagChange = (e) => {
    setHashtags(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = hashtags.trim().replace(/^#/, "");

      if (!newTag) return;

      if (newTag.length < 2) {
        setTagLimitMessage("두 글자 이상 입력해주세요.");
        return;
      }


      if (!newTag || parsedTags.includes(newTag) || newTag.length < 2) return;

      if (parsedTags.length >= 5) {
        setTagLimitMessage("해시태그는 최대 5개까지 입력할 수 있습니다.");
        return;
      }

      const updatedTags = [...parsedTags, newTag];
      setParsedTags(updatedTags);
      setTagLimitMessage("");
      setTimeout(() => {
        setHashtags("");
      }, 0);
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const newTags = parsedTags.filter((_, i) => i !== indexToRemove);
    setParsedTags(newTags);
    setHashtags(""); // ✅ 입력창에도 표시 안 되도록 바로 초기화
    setTagLimitMessage("");
  };


  const [postTypeCheck, setPostTypeCheck] = useState("");
  const [starRating, setStarRating] = useState(0);

  const [selectedFacilityName, setSelectedFacilityName] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [selectedBenefitName, setSelectedBenefitName] = useState("");
  useEffect(() => {
    if (!boardNo || isNaN(boardNo)) {
      alert("잘못된 접근입니다.");
      navigate("/mytownBoard");
      return;
    }

    axios
      .get(`/api/board/mytownBoard/${boardNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setBoard(data);
        setBoardTitle(data.boardTitle);
        setBoardContent(data.boardContent);

        setPostTypeCheck(
          data.postType === "후기"
            ? data.facilityApiServiceId
              ? "복지시설후기"
              : "복지혜택후기"
            : data.postType
        );

        setStarRating(data.starCount || 0);
        setSelectedFacilityId(data.facilityApiServiceId || "");

        // ✅ 이름 표시
        setSelectedFacilityName(data.facilityName || "");
        setSelectedBenefitName(data.welfareName || "");

        if (Array.isArray(data.hashtagList)) {
          setHashtags(data.hashtagList.map((tag) => `#${tag}`).join(" "));
        } else if (typeof data.hashtags === "string") {
          const tagArr = data.hashtags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t !== "");
          setHashtags(tagArr.map((tag) => `#${tag}`).join(" "));
        } else {
          setHashtags("");
        }
      })
      .catch((err) => {
        console.error("게시글 불러오기 실패", err);
        alert("게시글 정보를 가져오지 못했습니다.");
        navigate("/mytownBoard");
      });
  }, [boardNo, navigate, token]);

  useEffect(() => {
    if (board && Array.isArray(board.imageList)) {
      uploadedImagesRef.current = board.imageList.map((img) => {
        return `${img.imagePath.replace(/^\/+/, "")}/${img.imageName}`;
      });
    }
  }, [board]);

  useEffect(() => {
    if (!boardContent) return;

    if (isInitialSet.current) {
      $("#summernote").summernote({
        height: 300,
        lang: "ko-KR",
        callbacks: {
          onChange: function (contents) {
            if (isInitialSet.current) return;
            setBoardContent(contents);
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
                  console.error("이미지 업로드 실패", err);
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

      $("#summernote").summernote("code", boardContent);
      isInitialSet.current = false;
    }
  }, [boardContent]);

  const handleUpdate = async () => {
    const updatedContent = $("#summernote").summernote("code");

    // ✅ 제목/내용 빈값 검사
    if (!boardTitle.trim()) {
      alert("제목을 입력하세요.");
      return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = updatedContent;
    if (!tempDiv.textContent.trim() && !tempDiv.querySelector("img")) {
      alert("내용을 입력하세요.");
      return;
    }
    // 1. summernote에 삽입된 <img> 순서 기준으로 정렬
    const imgTags = Array.from(tempDiv.querySelectorAll("img"));
    const sortedImageUrls = imgTags.map((img) => img.getAttribute("src"));

    const imageList = sortedImageUrls
      .map((src) => {
        try {
          // src가 절대 URL이면 URL 객체에서 pathname 추출
          const url = new URL(src, window.location.origin);
          const pathParts = url.pathname.split("/").filter(Boolean); // ["images", "board", "파일명"]
          const imageName = pathParts.pop(); // 마지막 요소가 파일명
          const imagePath = "/" + pathParts.join("/"); // 나머지를 경로로

          return {
            imagePath,
            imageName,
          };
        } catch (e) {
          console.warn("⚠️ 이미지 URL 파싱 실패:", src);
          return null; // 유효하지 않으면 제외
        }
      })
      .filter(Boolean) // null 제거
      .map((img, index) => ({
        ...img,
        imageOrder: index, // 순서대로 번호 부여 (썸네일 = 0번)
      }));



    const hashtagList = parsedTags;

    const originHashtags =
      Array.isArray(board.hashtagList) && board.hashtagList.length > 0
        ? board.hashtagList
        : board.hashtags
        ? board.hashtags.split(",").map((t) => t.trim())
        : [];

    const isSameHashtag =
      JSON.stringify(hashtagList.sort()) ===
      JSON.stringify(originHashtags.sort());

    const isSame =
      boardTitle === board.boardTitle &&
      updatedContent === board.boardContent &&
      starRating === (board.starCount || 0) &&
      postTypeCheck ===
        (board.facilityApiServiceId
          ? "복지시설후기"
          : board.postType === "후기"
          ? "복지혜택후기"
          : board.postType) &&
      isSameHashtag &&
      imageList.length === 0;

    if (isSame) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    const updatedBoard = {
      boardTitle,
      boardContent: updatedContent,
      starCount: starRating,
      postType: postTypeCheck,
      hashtagList,
      imageList,
    };

    try {
      await axios.post(
        `/api/editboard/mytown/${boardNo}/update`,
        updatedBoard,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("수정이 완료되었습니다.");
      navigate(`/mytownBoard/${boardNo}`);
    } catch (err) {
      console.error(err);
      alert("수정에 실패했습니다.");
    }
  };

  if (!board) return <p>로딩 중...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeaderContainer}>
        <div className={styles.subText}>우리 동네 좋아요</div>
        <div className={styles.titleRow}>
          <h2 className={styles.pageTitle}>게시글 수정</h2>
          <span className={styles.tagButton}>
            {regionCity} {regionDistrict}
          </span>
          <span className={styles.tagButton}>{postTypeCheck}</span>

          {postTypeCheck === "복지시설후기" && selectedFacilityName && (
           <span className={styles.tagButton}>
             {selectedFacilityName}
            </span>
          )}
          {postTypeCheck === "복지혜택후기" && selectedBenefitName && (
         <span className={styles.tagButton}>
         {selectedBenefitName}
            </span>
          )}
        </div>
      </div>

      <div className={styles.filterBox}>
  <table className={styles.filterTable}>
        <tbody>
          <>
            {(postTypeCheck === "복지시설후기" ||
              postTypeCheck === "복지혜택후기") && (
   <tr className={styles.filterRow}>
         <th className={styles.filterLabel}>별점</th>
   <td className={styles.filterContent}>
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
                  <span style={{ marginLeft: "10px" }}>
                    {starRating ? `${starRating}점` : "선택 안됨"}
                  </span>
                </td>
              </tr>
            )}
          </>

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
      {tagLimitMessage && <p className={styles.errorText}>{tagLimitMessage}</p>}
      <br />

            {/* 제목 입력 */}
            <div className={styles.inputGroup}>
      <input
        type="text"
        value={boardTitle}
        onChange={(e) => setBoardTitle(e.target.value)}
        placeholder="제목"
                 className={styles.titleInput}
      /></div>

      <div id="summernote"></div>
 <div className={styles.buttonContainer}>
      <button
        onClick={handleUpdate}
      className={styles.submitButton}
      >
        수정 완료
      </button>
    </div>
        </div>
  );
}

export default MytownBoardUpdate;
