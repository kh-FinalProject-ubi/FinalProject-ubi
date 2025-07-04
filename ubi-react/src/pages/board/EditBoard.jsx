import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite.js";

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
  const [hasAlerted, setHasAlerted] = useState(false);

  const imageUploader = (file, el) => {
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("/api/editBoard/image-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const imageUrl = `/images/board/${res.data}`; // res.data가 업로드된 파일명이라 가정
        $("#summernote").summernote("insertImage", imageUrl, function ($image) {
          $image.css("width", "100%");
        });
      })
      .catch((err) => {
        alert("이미지 업로드 실패");
        console.error(err);
      });
  };

  useEffect(() => {
    if (!boardCodeInt) {
      alert("잘못된 게시판 경로입니다.");
      navigate("/", { replace: true });
    }
  }, [boardCodeInt, navigate]);

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

        if (!boardData.postType || boardData.postType.trim() === "") {
          if (boardData.boardType === 1) setPostType("공지");
          else if (boardData.boardType === 2) setPostType("문의");
        } else {
          setPostType(boardData.postType);
        }
      } catch (err) {
        alert("게시글 조회 중 오류 발생");
        navigate(`/${boardPath}/${boardNo}`, { replace: true });
      }
    };

    fetchBoard();
  }, [boardCodeInt, boardNo, token, navigate, hasAlerted, boardPath]);

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
          // ✅ 이 부분이 수정되었습니다.
          onImageUpload: (files) => {
            // Summernote는 여러 파일을 동시에 받을 수 있으므로 배열(files)로 전달됩니다.
            // 배열의 각 파일에 대해 만들어두신 imageUploader 함수를 호출합니다.
            for (const file of files) {
              imageUploader(file);
            }
          },
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
  }, [board, imageUploader]);

  useEffect(() => {
    if (board && summernoteInitialized.current) {
      const fullContent = board.boardContent || "";
      $("#summernote").summernote("code", fullContent);

      const $summernoteEditable = $("#summernote")
        .next(".note-editor")
        .find(".note-editable");

      $summernoteEditable.off("click", ".delete-image-btn");
      $summernoteEditable.on("click", ".delete-image-btn", (e) => {
        const imageName = $(e.currentTarget).data("image-name");
        deletedImagesRef.current.add(imageName);
        $(`[data-image-name="${imageName}"]`).hide();
      });
    }
  }, [board]);

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
    const isImageDeleted = deletedImagesRef.current.size > 0;
    const isPostTypeChanged = postType !== originalBoardRef.current.postType;

    if (
      !isTitleChanged &&
      !isContentChanged &&
      !isImageDeleted &&
      !isPostTypeChanged
    ) {
      alert("수정된 내용이 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("boardTitle", board.boardTitle);
    formData.append("boardContent", contentRef.current);
    formData.append("postType", postType);
    formData.append("boardType", board.boardType);

    if (deletedImagesRef.current.size > 0) {
      const deleteList = Array.from(deletedImagesRef.current).join(",");
      formData.append("deleteOrderList", deleteList);
    }

    try {
      const res = await axios.put(
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
        <select
          name="postType"
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
        >
          {board.boardType === 1 && (
            <>
              <option value="공지">공지</option>
              <option value="이벤트">이벤트</option>
              <option value="중요">중요</option>
            </>
          )}
          {board.boardType === 2 && (
            <>
              <option value="문의">문의</option>
              <option value="신고">신고</option>
            </>
          )}
        </select>

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
