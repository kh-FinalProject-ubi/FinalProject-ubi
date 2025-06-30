import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // imageUploader에서 axios를 사용하므로 import
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

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("");

  // [수정 1] 별도의 이미지 상태 관리 제거
  // const [images, setImages] = useState([]);

  const numericBoardCode = boardCodeMap[boardCode];
  const summernoteInitialized = useRef(false);
  // content는 이제 state로 관리하므로 ref는 필요 없습니다.
  // const contentRef = useRef("");

  // imageUploader는 컴포넌트 내에 정의하는 것이 좋습니다.
  // (axios가 정의되지 않았다는 오류를 방지하기 위해 axios import 추가)
  const imageUploader = (file, el) => {
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("/api/editBoard/image-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        // 서버 응답이 이미지 파일명만 오는 경우, 전체 경로를 만들어줍니다.
        // 만약 서버가 전체 URL을 준다면 res.data를 바로 사용하면 됩니다.
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
            // Summernote의 내용이 변경될 때마다 content state를 업데이트합니다.
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

  useEffect(() => {
    if (numericBoardCode === 1) {
      setPostType("공지");
    } else if (numericBoardCode === 2) {
      setPostType("문의");
    } else {
      setPostType("");
    }
  }, [numericBoardCode]);

  // [수정 2] 별도의 파일 변경 핸들러 제거
  // const onFileChange = (e) => {
  //   setImages(Array.from(e.target.files));
  // };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    // Summernote는 기본적으로 <p><br></p> 태그를 가지므로,
    // 실제 내용이 있는지 더 정확히 확인하려면 태그를 제거하고 비교하는 것이 좋습니다.
    const pureContent = content.replace(/<[^>]*>?/g, "").trim();
    if (!pureContent) {
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
      boardContent: content, // state에 저장된 최신 HTML 내용을 사용
      memberNo: loginMemberNo,
      postType,
      boardCode: numericBoardCode,
    };

    formData.append(
      "board",
      new Blob([JSON.stringify(boardObj)], { type: "application/json" })
    );

    // [수정 3] handleSubmit에서 직접 이미지를 첨부하는 로직 완전 제거
    // images.forEach((file) => {
    //   formData.append("images", file);
    // });

    fetch(`/api/editBoard/${numericBoardCode}/insert`, {
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
            <option value="신고">신고</option>
            <option value="문의">문의</option>
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
