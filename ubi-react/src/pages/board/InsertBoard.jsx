import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  const [postType, setPostType] = useState(""); // 기본값 설정
  const [images, setImages] = useState([]);

  const numericBoardCode = boardCodeMap[boardCode];

  useEffect(() => {
    $("#summernote").summernote({
      height: 300,
      callbacks: {
        onChange: (contents) => {
          setContent(contents);
        },
      },
    });

    return () => {
      $("#summernote").summernote("destroy");
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
      postType, // 여기 추가
      boardCode: numericBoardCode, // 혹시 필요하면 같이 넣기
    };

    formData.append(
      "board",
      new Blob([JSON.stringify(boardObj)], { type: "application/json" })
    );

    images.forEach((file) => {
      formData.append("images", file);
    });

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
          const boardNo = data.boardNo; // ✅ 여기서 boardNo 꺼내기
          navigate(`/${boardCode}/${boardNo}`); // 예: /noticeBoard/69
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
      {numericBoardCode === 2 && (
        <select value={postType} onChange={(e) => setPostType(e.target.value)}>
          <option value="신고">신고</option>
          <option value="문의">문의</option>
        </select>
      )}

      {numericBoardCode === 1 && (
        <select value={postType} onChange={(e) => setPostType(e.target.value)}>
          <option value="공지">공지</option>
          <option value="이벤트">이벤트</option>
          <option value="중요">중요</option>
        </select>
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={onFileChange}
        style={{ display: "block", marginTop: 10 }}
      />
      <div id="summernote" style={{ marginTop: 10 }} />
      <button onClick={() => navigate(-1)}>목록</button>
      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        글쓰기 완료
      </button>
    </div>
  );
};

export default InsertBoard;
