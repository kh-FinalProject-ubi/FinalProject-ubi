import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite.js";
import useAuthStore from "../../stores/useAuthStore";

function MytownBoardUpdate() {
  const { boardNo } = useParams();
  const { token } = useAuthStore(); // ✅ 토큰 가져오기
  const [board, setBoard] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [boardContent, setBoardContent] = useState("");
  const uploadedImagesRef = useRef([]);
  const navigate = useNavigate();
  const isInitialSet = useRef(true);
  const [hashtags, setHashtags] = useState("");
  const [postTypeCheck, setPostTypeCheck] = useState("");
  const [starRating, setStarRating] = useState(0);

  const postTypeCheckOptions = ["자유", "자랑", "복지시설후기", "복지혜택후기"];
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [selectedFacilityName, setSelectedFacilityName] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");

  // 1. 게시글 데이터 불러오기
  useEffect(() => {
    if (!boardNo || isNaN(boardNo)) {
      alert("잘못된 접근입니다.");
      navigate("/mytownBoard");
      return;
    }

    axios
      .get(`/api/board/mytownBoard/${boardNo}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 토큰 포함
        },
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
        setSelectedFacilityName(
          data.facilityApiServiceId ? "(기존 시설 표시 가능 시 이름 fetch)" : ""
        );

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

  // 2. 썸머노트 초기화
  useEffect(() => {
    // boardContent가 로드될 때까지 초기화하지 말자
    if (!boardContent) return;

    // 초기화는 딱 한번만
    if (isInitialSet.current) {
      $("#summernote").summernote({
        height: 300,
        lang: "ko-KR",
        callbacks: {
          onChange: function (contents) {
            if (isInitialSet.current) return; // 초기 세팅 무시
            setBoardContent(contents);
          },
          onImageUpload: function (files) {
            const formData = new FormData();
            formData.append("image", files[0]);

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
          },
        },
        toolbar: [
          ["style", ["bold", "italic", "underline"]],
          ["para", ["ul", "ol"]],
          ["insert", ["link", "picture"]],
          ["misc", ["undo", "redo"]],
        ],
      });

      // 초기 내용 세팅
      $("#summernote").summernote("code", boardContent);
      isInitialSet.current = false;
    }
  }, [boardContent]);

  // 3. 수정 요청 처리
  const handleUpdate = async () => {
    const updatedContent = $("#summernote").summernote("code");

    const imageList = uploadedImagesRef.current.map((url, index) => {
      const segments = url.split("/");
      return {
        imagePath: "/" + segments.slice(0, -1).join("/"),
        imageName: segments[segments.length - 1],
        imageOrder: index,
      };
    });

    const hashtagList = hashtags
      .split(" ")
      .map((tag) => tag.replace("#", "").trim())
      .filter((tag) => tag.length > 0);

    // 🔍 변경사항 감지
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
      imageList.length === 0; // 이미지 추가/삭제 없으면 수정 안 한 것으로 간주

    if (isSame) {
      alert("변경된 내용이 없습니다.");
      return; // 서버 요청 막기
    }

    // 수정 요청
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
    <div
      className="board-update-container"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <h2>게시글 수정</h2>
      <table
        border="1"
        style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}
      >
        <tbody>
          <tr>
            <th>작성유형</th>
            <td>
              {postTypeCheckOptions.map((type) => (
                <label key={type} style={{ marginRight: "15px" }}>
                  <input
                    type="radio"
                    name="postTypeCheck"
                    value={type}
                    checked={postTypeCheck === type}
                    onChange={(e) => setPostTypeCheck(e.target.value)}
                  />
                  {type}
                  {postTypeCheck === type && type === "복지시설후기" && (
                    <>
                      <button onClick={() => setShowFacilityModal(true)}>
                        복지시설 선택
                      </button>
                      {selectedFacilityName && (
                        <span> 선택: {selectedFacilityName}</span>
                      )}
                    </>
                  )}
                  {postTypeCheck === type && type === "복지혜택후기" && (
                    <button onClick={() => setShowBenefitModal(true)}>
                      복지혜택 선택
                    </button>
                  )}
                </label>
              ))}
            </td>
          </tr>
          {(postTypeCheck === "복지시설후기" ||
            postTypeCheck === "복지혜택후기") && (
            <tr>
              <th>별점</th>
              <td>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setStarRating(star)}
                    style={{
                      cursor: "pointer",
                      color: starRating >= star ? "orange" : "lightgray",
                      fontSize: "24px",
                    }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ marginLeft: "10px" }}>
                  {starRating ? `${starRating}점` : "선택 안됨"}
                </span>
              </td>
            </tr>
          )}
          <tr>
            <th>해시태그</th>
            <td>
              <input
                type="text"
                placeholder="#해시태그를 샵(#)으로 구분해 입력"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                style={{ width: "80%" }}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <br />
      <input
        type="text"
        value={boardTitle}
        onChange={(e) => setBoardTitle(e.target.value)}
        placeholder="제목"
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <div id="summernote"></div>

      <button
        onClick={handleUpdate}
        className="submit-btn"
        style={{ marginTop: "20px" }}
      >
        수정 완료
      </button>
    </div>
  );
}

export default MytownBoardUpdate;
