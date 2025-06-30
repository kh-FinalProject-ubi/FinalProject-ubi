import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";
import $ from "jquery";

const IMAGE_BASE_URL = "/images/board";

const EditBoard = () => {
  const { boardPath, boardNo } = useParams();
  const navigate = useNavigate();
  const { token, role, memberNo: loginMemberNo } = useAuthStore();

  const summernoteInitialized = useRef(false);
  const contentRef = useRef("");
  const originalBoardRef = useRef(null);
  const deletedImagesRef = useRef(new Set());

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };
  const boardCodeInt = boardCodeMap[boardPath];

  const [board, setBoard] = useState(null);
  const [postType, setPostType] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    if (!boardCodeInt) {
      alert("잘못된 게시판 경로입니다.");
      navigate("/", { replace: true });
    }
  }, [boardCodeInt, navigate]);

  const handleDeleteImage = useCallback((imageName) => {
    deletedImagesRef.current.add(imageName);
    const imageContainer = $(`[data-image-name="${imageName}"]`);
    imageContainer.hide();
  }, []);

  useEffect(() => {
    if (!token) {
      if (!hasAlerted) {
        alert("로그인이 필요합니다.");
        setHasAlerted(true);
      }
      navigate("/", { replace: true });
      return;
    }

    if (!boardCodeInt || !boardNo) return;

    const fetchBoard = async () => {
      try {
        const res = await axios.get(
          `/api/editBoard/${boardCodeInt}/${boardNo}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const { board: boardData, role: userRole, memberNo: userNo } = res.data;

        if (
          boardData.boardType === 2 &&
          !(userNo === boardData.memberNo || userRole === "ADMIN")
        ) {
          alert("수정 권한이 없습니다.");
          navigate(`/askBoard/${boardNo}`, { replace: true });
          return;
        }

        if (boardData.boardType === 1 && userRole !== "ADMIN") {
          alert("관리자만 수정할 수 있습니다.");
          navigate(`/noticeBoard/${boardNo}`, { replace: true });
          return;
        }

        setBoard(boardData);
        originalBoardRef.current = boardData;
        setPostType(boardData.postType || "");
      } catch (err) {
        alert("게시글 조회 중 오류 발생");
        navigate(`/${boardPath}/${boardNo}`, { replace: true });
      }
    };

    fetchBoard();
  }, [boardCodeInt, boardNo, token, navigate, hasAlerted, boardPath]);

  // 썸머노트 이미지 업로드 콜백: base64 미리보기 삽입 + 실제 파일 newImages에 저장
  const onImageUpload = (files) => {
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = `<p style="color:gray;">[미리보기 이미지: ${file.name}]</p>`;
        $("#summernote").summernote("pasteHTML", preview);
      };
      reader.readAsDataURL(file);
      setNewImages((prev) => [...prev, file]);
    }
  };

  useEffect(() => {
    if (!summernoteInitialized.current && board) {
      $("#summernote").summernote({
        height: 300,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "italic", "underline", "strikethrough", "clear"]],
          ["fontsize", ["fontsize"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["height", ["height"]],
          ["insert", ["link", "picture"]],
        ],
        callbacks: {
          onChange: (contents) => {
            contentRef.current = contents;
          },
          onImageUpload: onImageUpload,
        },
      });
      summernoteInitialized.current = true;
    }

    return () => {
      if (summernoteInitialized.current) {
        $("#summernote").summernote("destroy");
        summernoteInitialized.current = false;
      }
    };
  }, [board]);

  useEffect(() => {
    if (board && summernoteInitialized.current) {
      let fullContent = board.boardContent || "";

      if (board.images && board.images.length > 0) {
        const imageHtml = board.images
          .map(
            (image) => `
    <span class="image-wrapper" style="position:relative; display:inline-block;" data-image-name="${image.boardImageName}">
      <img src="${IMAGE_BASE_URL}/${image.boardImageName}" style="max-width: 100%; height: auto;" />
      <button type="button" class="delete-image-btn" data-image-name="${image.boardImageName}"
        style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.5); color: white;
               border: none; border-radius: 50%; width: 20px; height: 20px;
               text-align: center; cursor: pointer; font-weight: bold;">x</button>
    </span>
  `
          )
          .join("");

        $("#summernote").summernote("code", board.boardContent + imageHtml);
      }

      $("#summernote").summernote("code", fullContent);

      const $summernoteEditable = $("#summernote")
        .next(".note-editor")
        .find(".note-editable");

      $summernoteEditable.off("click", ".delete-image-btn");
      $summernoteEditable.on("click", ".delete-image-btn", (e) => {
        const imageName = $(e.currentTarget).data("image-name");
        deletedImagesRef.current.add(imageName);
        $(`[data-image-name="${imageName}"]`).hide(); // Summernote 안에서 시각적으로 삭제
      });
    }
  }, [board, handleDeleteImage]);

  function imageUploader(file, el) {
    var formData = new FormData();
    formData.append("file", file);

    $.ajax({
      data: formData,
      type: "POST",
      url: "/editBoard/image-upload",
      contentType: false,
      processData: false,
      enctype: "multipart/form-data",
      success: function (data) {
        $(el).summernote(
          "insertImage",
          "${pageContext.request.contextPath}/assets/images/upload/" + data,
          function ($image) {
            $image.css("width", "100%");
          }
        );
        // 값이 잘 넘어오는지 콘솔 확인 해보셔도됩니다.
        console.log(data);
      },
    });
  }

  const handleChange = (e) => {
    setBoard({ ...board, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!board || !originalBoardRef.current) return;

    const isTitleChanged =
      board.boardTitle !== originalBoardRef.current.boardTitle;
    const isContentChanged =
      contentRef.current !== originalBoardRef.current.boardContent;
    const isImageAdded = newImages.length > 0;
    const isImageDeleted = deletedImagesRef.current.size > 0;
    const isPostTypeChanged = postType !== originalBoardRef.current.postType;

    if (
      !isTitleChanged &&
      !isContentChanged &&
      !isImageAdded &&
      !isImageDeleted &&
      !isPostTypeChanged
    ) {
      alert("수정된 내용이 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("boardTitle", board.boardTitle);
    formData.append("boardContent", board.boardContent);
    formData.append("postType", postType);
    formData.append("boardType", board.boardType);

    // 실제 이미지 파일들은 formData로 첨부
    newImages.forEach((img) => formData.append("images", img));

    // 삭제된 이미지 order 리스트도 전송
    if (deletedImagesRef.current.size > 0) {
      const deleteList = Array.from(deletedImagesRef.current).join(",");
      formData.append("deleteOrderList", deleteList);
    }

    try {
      const res = await axios.post(
        `/api/editBoard/${boardCodeInt}/${boardNo}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(res.data.message || "수정 완료");
      navigate(`/${boardPath}/${boardNo}`);
    } catch (err) {
      alert(err.response?.data?.message || "수정 실패");
      navigate(-1);
    }
  };

  if (!board) return <p>로딩 중...</p>;

  return (
    <main className="container">
      <h2>게시글 수정</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="boardTitle">제목</label>
        <input
          type="text"
          id="boardTitle"
          name="boardTitle"
          value={board.boardTitle || ""}
          onChange={handleChange}
          required
        />

        {board.boardType === 2 && (
          <select
            name="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
          >
            <option value="신고">신고</option>
            <option value="문의">문의</option>
          </select>
        )}

        {board.boardType === 1 && (
          <select
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
          >
            <option value="공지">공지</option>
            <option value="이벤트">이벤트</option>
            <option value="중요">중요</option>
          </select>
        )}

        <label htmlFor="boardContent">내용</label>
        <div id="summernote" />

        <div style={{ marginTop: "1rem" }}>
          <button type="button" onClick={() => navigate(-1)}>
            수정 취소
          </button>
          <button type="submit" style={{ marginLeft: "1rem" }}>
            수정 완료
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditBoard;
