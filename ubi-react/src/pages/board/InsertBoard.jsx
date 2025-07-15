import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite";
import useAuthStore from "../../stores/useAuthStore";
import styles from "../../styles/board/InsertBoard.module.css";

const boardCodeMap = {
  noticeBoard: 1,
  askBoard: 2,
};

const InsertBoard = () => {
  const { token, memberNo: loginMemberNo } = useAuthStore();
  const { boardCode } = useParams();
  const navigate = useNavigate();

  const numericBoardCode = boardCodeMap[boardCode];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("");
  const [images, setImages] = useState([]); // 이 상태는 현재 UI에서 사용되지 않지만, 로직을 위해 유지합니다.

  const summernoteInitialized = useRef(false);

  // Summernote 이미지 업로더 (기존 기능 유지)
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

  // 게시판 유형에 따라 postType 초기값 설정 (기존 기능 유지)
  useEffect(() => {
    if (numericBoardCode === 1) {
      setPostType("공지");
    } else if (numericBoardCode === 2) {
      setPostType("문의");
    }
  }, [numericBoardCode]);

  // Summernote 초기화 (기존 기능 유지)
  useEffect(() => {
    if (!summernoteInitialized.current) {
      $("#summernote").summernote({
        height: 400,
        placeholder: "내용을 입력하세요.",
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
            // HTML 태그 제거하고 글자수만 체크
            const textLength = $("<div>").html(contents).text().length;
            if (textLength > 2000) {
              const trimmed = $("<div>")
                .html(contents)
                .text()
                .substring(0, 2000);
              $("#summernote").summernote("code", trimmed);
            } else {
              setContent(contents);
            }
          },
          onKeydown: (e) => {
            const textLength = $("<div>")
              .html($("#summernote").summernote("code"))
              .text().length;
            if (textLength >= 2000 && e.key.length === 1) {
              e.preventDefault();
            }
          },
          onImageUpload: (files) => {
            for (const file of files) imageUploader(file);
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
  }, []);

  // 폼 제출 핸들러 (기존 기능 유지)
  const handleSubmit = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    if (!numericBoardCode) {
      alert("올바른 게시판 경로가 아닙니다.");
      return;
    }

    const formData = new FormData();
    const boardObj = {
      boardTitle: title,
      boardContent: content,
      memberNo: loginMemberNo,
      postType,
      boardCode: numericBoardCode,
    };

    formData.append(
      "board",
      new Blob([JSON.stringify(boardObj)], { type: "application/json" })
    );

    images.forEach((file) => formData.append("images", file));

    fetch(`/api/editBoard/${numericBoardCode}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`서버 오류: ${res.status}\n${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.boardNo) {
          const boardNo = data.boardNo;
          navigate(`/${boardCode}/${boardNo}`);
        } else {
          alert("작성에 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error("글쓰기 실패:", err.message);
        alert("서버 오류 발생. 콘솔 로그를 확인하세요.");
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <select
          name="postType"
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className={styles.postTypeSelect}
        >
          {numericBoardCode === 1 && (
            <>
              <option value="공지">공지</option>
              <option value="이벤트">이벤트</option>
              <option value="중요">중요</option>
            </>
          )}
          {numericBoardCode === 2 && (
            <>
              <option value="문의">문의</option>
              <option value="신고">신고</option>
            </>
          )}
        </select>
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
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
    </div>
  );
};

export default InsertBoard;
