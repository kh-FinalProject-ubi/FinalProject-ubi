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
  const { token, role, memberNo: loginMemberNo } = useAuthStore();
  const summernoteInitialized = useRef(false);
  const contentRef = useRef("");

  const boardCodeMap = {
    noticeBoard: 1,
    askBoard: 2,
  };
  const boardCodeInt = boardCodeMap[boardPath];

  // 잘못된 경로면 경고 후 리다이렉트 (useEffect 안에서 처리)
  useEffect(() => {
    if (!boardCodeInt) {
      alert("잘못된 게시판 경로입니다.");
      navigate("/", { replace: true });
    }
  }, [boardCodeInt, navigate]);

  const [board, setBoard] = useState(null);
  const [images, setImages] = useState([]);
  const [hasAlerted, setHasAlerted] = useState(false);

  // 로그인 체크 및 게시글 조회
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

        // 권한 체크
        if (boardData.boardType === 2) {
          if (!(userNo === boardData.memberNo || userRole === "ADMIN")) {
            if (!hasAlerted) {
              alert("수정 권한이 없습니다.");
              setHasAlerted(true);
            }
            navigate(`/askBoard/${boardNo}`, { replace: true });
            return;
          }
        } else if (boardData.boardType === 1) {
          if (userRole !== "ADMIN") {
            if (!hasAlerted) {
              alert("관리자만 수정할 수 있습니다.");
              setHasAlerted(true);
            }
            navigate(`/noticeBoard/${boardNo}`, { replace: true });
            return;
          }
        }

        setBoard(boardData);
      } catch (err) {
        if (!hasAlerted) {
          if (err.response?.status === 403) {
            alert("접근 권한이 없습니다.");
          } else if (err.response?.status === 404) {
            alert("게시글이 존재하지 않습니다.");
          } else {
            alert("오류가 발생했습니다.");
          }
          setHasAlerted(true);
        }
        navigate(`/noticeBoard/${boardNo}`, { replace: true });
      }
    };

    fetchBoard();
  }, [boardCodeInt, boardNo, token, navigate, hasAlerted]);

  // summernote 초기화 (한번만)
  useEffect(() => {
    if (!summernoteInitialized.current) {
      $("#summernote").summernote({
        height: 300,
        focus: true,
        callbacks: {
          onChange: (contents) => {
            contentRef.current = contents; // 여기서 state 업데이트 하지 않음
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

  // board 데이터가 로드된 후 summernote 내용 세팅
  useEffect(() => {
    if (board && summernoteInitialized.current) {
      $("#summernote").summernote("code", board.boardContent || "");
    }
  }, [board]);

  const handleChange = (e) => {
    setBoard({ ...board, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!board) return;

    const formData = new FormData();
    formData.append("boardTitle", board.boardTitle);
    formData.append("boardContent", contentRef.current); // 여기
    images.forEach((img) => formData.append("images", img));
    formData.append("boardType", board.boardType);

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
      navigate(-1);
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

        <label htmlFor="boardContent" name="boardContent">
          내용
        </label>
        <div id="summernote" />

        <label htmlFor="images">이미지 첨부</label>
        <input
          type="file"
          id="images"
          name="boardImage"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />

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
