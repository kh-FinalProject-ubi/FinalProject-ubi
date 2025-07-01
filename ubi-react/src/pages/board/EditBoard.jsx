import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";
import $ from "jquery";

const EditBoard = () => {
  const { boardPath, boardNo } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const contentRef = useRef("");
  const summernoteInit = useRef(false);
  const deletedImagesRef = useRef(new Set());
  const originalBoardRef = useRef(null);

  const boardCodeMap = { noticeBoard: 1, askBoard: 2 };
  const boardCodeInt = boardCodeMap[boardPath];

  const [board, setBoard] = useState(null);
  const [postType, setPostType] = useState("");

  const imageUploader = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("boardNo", boardNo);

    axios
      .post("/api/editBoard/image-edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const imageUrl = res.data;
        $("#summernote").summernote("insertImage", imageUrl, ($img) => {
          $img.css("width", "100%");
        });
      })
      .catch((err) => {
        alert("이미지 업로드 실패");
        console.error(err);
      });
  };

  // 1. 게시글 불러오기
  useEffect(() => {
    if (!token || !boardCodeInt || !boardNo) {
      navigate("/", { replace: true });
      return;
    }

    axios
      .get(`/api/editBoard/${boardCodeInt}/${boardNo}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { board } = res.data;
        setBoard(board);
        originalBoardRef.current = board;
        setPostType(board.postType || "");
      })
      .catch((err) => {
        alert("게시글 조회 실패");
        navigate(-1);
      });
  }, [boardCodeInt, boardNo, token, navigate]);

  // 2. 에디터 초기화
  useEffect(() => {
    if (board && !summernoteInit.current) {
      $("#summernote").summernote({
        height: 300,
        callbacks: {
          onChange: (contents) => {
            contentRef.current = contents;
          },
          onImageUpload: (files) => {
            for (const file of files) imageUploader(file);
          },
        },
      });
      summernoteInit.current = true;
    }

    return () => {
      if (summernoteInit.current) {
        $("#summernote").summernote("destroy");
        summernoteInit.current = false;
      }
    };
  }, [board]);

  // 3. 본문 삽입 및 삭제 버튼 추가
  useEffect(() => {
    if (board && summernoteInit.current) {
      $("#summernote").summernote("code", board.boardContent || "");

      const $editable = $("#summernote")
        .next(".note-editor")
        .find(".note-editable");

      // 기존에 삽입된 모든 img에 x 버튼 추가
      $editable.find("img").each(function () {
        const $img = $(this);
        const src = $img.attr("src");
        const imageName = src.split("/").pop();
        $img.attr("data-image-name", imageName);

        const $wrapper = $("<div>").css({
          position: "relative",
          display: "inline-block",
        });
        const $xBtn = $("<button>")
          .text("x")
          .addClass("delete-image-btn")
          .css({
            position: "absolute",
            top: "5px",
            right: "5px",
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            cursor: "pointer",
          })
          .attr("data-image-name", imageName);

        $img.wrap($wrapper);
        $img.parent().append($xBtn);
      });

      $editable
        .off("click", ".delete-image-btn")
        .on("click", ".delete-image-btn", function (e) {
          const imageName = $(this).data("image-name");
          deletedImagesRef.current.add(imageName);
          $(this).parent().remove(); // wrapper 삭제 (img + 버튼 함께 삭제)
        });
    }
  }, [board]);

  // 4. 제목/타입 변경 핸들러
  const handleChange = (e) => {
    setBoard({ ...board, [e.target.name]: e.target.value });
  };

  // 5. 제출
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("boardTitle", board.boardTitle);
    formData.append("boardContent", contentRef.current);
    formData.append("postType", postType);
    formData.append("boardType", board.boardType);

    if (deletedImagesRef.current.size > 0) {
      formData.append(
        "deleteOrderList",
        Array.from(deletedImagesRef.current).join(",")
      );
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
      alert("수정 완료");
      navigate(`/${boardPath}/${boardNo}`);
    } catch (err) {
      alert("수정 실패");
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

        <label>내용</label>
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
