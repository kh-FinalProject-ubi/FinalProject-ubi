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
  const { memberNo } = useAuthStore();
  const { boardCode } = useParams(); // URL param, string 타입
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    $("#summernote").summernote({
      height: 300,
      callbacks: {
        onChange: function (contents) {
          setContent(contents);
        },
      },
    });

    // 컴포넌트 언마운트 시 summernote 정리
    return () => {
      $("#summernote").summernote("destroy");
    };
  }, []);

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    fetch(`/api/editboard/${boardCode}/insert`, {
      method: "POST", // POST로 수정
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        memberNo,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`서버 오류: ${res.status} \n${errorText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.boardNo) {
          navigate(`/${boardPath}`); // 작성 완료 후 게시판 목록으로 이동
        } else {
          alert("작성에 실패했습니다.");
        }
      })
      .catch((err) => {
        console.error("글쓰기 실패:", err.message);
        alert("서버 오류 발생. 콘솔 로그 확인");
      });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div id="summernote" />
      <button onClick={handleSubmit}>글쓰기 완료</button>
    </div>
  );
};

export default InsertBoard;
