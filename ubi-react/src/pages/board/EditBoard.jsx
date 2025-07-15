import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite.js";
import styles from "../../styles/board/InsertBoard.module.css";

const EditBoard = () => {
  const { boardPath, boardNo } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();

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

  // 이미지 업로더 (기존 기능 유지)
  const imageUploader = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    axios
      .post("/api/editBoard/image-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const imageUrl = `/images/board/${res.data}`;
        $("#summernote").summernote("insertImage", imageUrl, ($image) => {
          $image.css("width", "100%");
        });
      })
      .catch((err) => {
        alert("이미지 업로드 실패");
        console.error(err);
      });
  };

  // 데이터 로딩 및 권한 확인 (기존 기능 유지)
  useEffect(() => {
    if (!token && !hasAlerted) {
      alert("로그인이 필요합니다.");
      setHasAlerted(true);
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
        setPostType(
          boardData.postType || (boardData.boardType === 1 ? "공지" : "문의")
        );
      } catch (err) {
        alert("게시글 조회 중 오류 발생");
        navigate(`/${boardPath}/${boardNo}`, { replace: true });
      }
    };
    fetchBoard();
  }, [boardCodeInt, boardNo, token, navigate, hasAlerted, boardPath]);

  // Summernote 초기화 (기존 기능 유지)
  useEffect(() => {
    if (board && !summernoteInitialized.current) {
      $("#summernote").summernote({
        height: 400,
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
          onImageUpload: (files) => {
            for (const file of files) imageUploader(file);
          },
        },
      });
      $("#summernote").summernote("code", board.boardContent || "");
      summernoteInitialized.current = true;
    }
    return () => {
      if (summernoteInitialized.current) {
        $("#summernote").summernote("destroy");
        summernoteInitialized.current = false;
      }
    };
  }, [board]);

  // 폼 제출 핸들러 (기존 기능 유지)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!board || !originalBoardRef.current) return;

    const isTitleChanged =
      board.boardTitle !== originalBoardRef.current.boardTitle;
    const isContentChanged =
      contentRef.current !== originalBoardRef.current.boardContent;
    const isPostTypeChanged = postType !== originalBoardRef.current.postType;

    if (!isTitleChanged && !isContentChanged && !isPostTypeChanged) {
      alert("수정된 내용이 없습니다.");
      return;
    }

    const formData = new FormData();
    formData.append("boardTitle", board.boardTitle);
    formData.append("boardContent", contentRef.current);
    formData.append("postType", postType);
    formData.append("boardType", board.boardType);

    try {
      await axios.put(`/api/editBoard/${boardCodeInt}/${boardNo}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      alert("수정 완료");
      navigate(`/${boardPath}/${boardNo}`);
    } catch (err) {
      alert(err.response?.data?.message || "수정 실패");
      navigate(-1);
    }
  };

  if (!board) return <p>로딩 중...</p>;

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <select
            name="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value)}
            className={styles.postTypeSelect}
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
          <input
            type="text"
            id="boardTitle"
            name="boardTitle"
            value={board.boardTitle || ""}
            onChange={(e) =>
              setBoard({ ...board, [e.target.name]: e.target.value })
            }
            required
            className={styles.titleInput}
          />
        </div>

        <div id="summernote" />

        <div className={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.listButton}
          >
            수정 취소
          </button>
          <button type="submit" className={styles.submitButton}>
            수정 완료
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBoard;
