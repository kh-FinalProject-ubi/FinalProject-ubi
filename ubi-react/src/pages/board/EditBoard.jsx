import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import useAuthStore from "../../stores/useAuthStore";

const EditBoard = () => {
  const { boardCode, boardNo } = useParams();
  const navigate = useNavigate();
  const { token, role, memberNo: loginMemberNo } = useAuthStore();

  const [board, setBoard] = useState(null);
  const [images, setImages] = useState([]);
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    if (!token) {
      if (!hasAlerted) {
        alert("로그인이 필요합니다.");
        setHasAlerted(true);
      }
      navigate("/");
      return;
    }

    const fetchBoard = async () => {
      try {
        const res = await axios.get(`/api/editBoard/${boardCode}/${boardNo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const { board: boardData, role: userRole, memberNo: userNo } = res.data;
        console.log("백엔드에서 받은 role:", userRole); // "ADMIN" 나오는지 확인
        console.log("글 작성자:", boardData.memberNo, "로그인 유저:", userNo);
        console.log("토큰:", token);

        // 권한 체크
        // 문의 게시판(boardType=2): 작성자 or 관리자만 수정 가능
        // 공지 게시판(boardType=1): 관리자만 수정 가능
        if (boardData.boardType === 2) {
          if (!(userNo === boardData.memberNo || userRole === "ADMIN")) {
            if (!hasAlerted) {
              alert("수정 권한이 없습니다.");
              setHasAlerted(true);
            }
            navigate(`/noticeBoard/detail/${boardNo}`);
            return;
          }
        } else if (boardData.boardType === 1) {
          if (userRole !== "ADMIN") {
            if (!hasAlerted) {
              alert("관리자만 수정할 수 있습니다.");
              setHasAlerted(true);
            }
            navigate(`/noticeBoard/detail/${boardNo}`);
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
        navigate(`/noticeBoard/detail/${boardNo}`);
      }
    };

    fetchBoard();
  }, [boardCode, boardNo, token, navigate, hasAlerted]);

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
    formData.append("boardContent", board.boardContent);
    images.forEach((img) => formData.append("images", img));

    try {
      const res = await axios.post(
        `/api/editBoard/${boardCode}/${boardNo}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(res.data.message || "수정 완료");
      navigate(`/board/${boardCode}/${boardNo}`);
    } catch (err) {
      alert(err.response?.data?.message || "수정 실패");
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

        <label htmlFor="boardContent">내용</label>
        <textarea
          id="boardContent"
          name="boardContent"
          value={board.boardContent || ""}
          onChange={handleChange}
          required
        />

        <label htmlFor="images">이미지 첨부</label>
        <input
          type="file"
          id="images"
          name="images"
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
