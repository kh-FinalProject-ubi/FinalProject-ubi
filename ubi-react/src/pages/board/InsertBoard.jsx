import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "summernote/dist/summernote-lite.css";
import $ from "jquery";
import "summernote/dist/summernote-lite";
import useAuthStore from "../../stores/useAuthStore";

const boardCodeMap = {
  noticeBoard: 1,
  askBoard: 2,
};

const InsertBoard = () => {
  const { token, memberNo: loginMemberNo } = useAuthStore();
  const { boardCode } = useParams(); // "noticeBoard" or "askBoard"
  const navigate = useNavigate();

  const numericBoardCode = boardCodeMap[boardCode];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState(""); // 후에 useEffect에서 기본값 지정
  const [images, setImages] = useState([]);

  const summernoteInitialized = useRef(false);
  const contentRef = useRef("");

  const imageUploader = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("/api/editBoard/image-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const imageUrl = `/images/board/${res.data}`;
        $("#summernote").summernote("insertImage", imageUrl, function ($image) {
          $image.css("width", "100%");
        });
      })
      .catch((err) => {
        alert("이미지 업로드 실패");
        console.error(err);
      });
  };

  // ✅ 게시판 유형에 따라 postType 초기값 설정
  useEffect(() => {
    if (numericBoardCode === 1) {
      setPostType("공지");
    } else if (numericBoardCode === 2) {
      setPostType("문의");
    }
  }, [numericBoardCode]);

  useEffect(() => {
    if (!summernoteInitialized.current) {
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
            setContent(contents);
          },
          onImageUpload: (files) => {
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
  }, []);

  const onFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

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

    images.forEach((file) => {
      formData.append("images", file);
    });

    fetch(`/api/editBoard/${numericBoardCode}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
          alert("작성 성공");
          console.log("✅ 작성 결과:", data);
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
    <div>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ marginRight: 10 }}
      />

      <select
        name="postType"
        value={postType}
        onChange={(e) => setPostType(e.target.value)}
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

      <div id="summernote" style={{ marginTop: 10 }} />

      <button onClick={() => navigate(-1)}>목록</button>
      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        글쓰기 완료
      </button>
    </div>
  );
};

export default InsertBoard;
