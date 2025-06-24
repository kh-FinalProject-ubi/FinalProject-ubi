import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditBoard() {
  const { boardCode, boardNo } = useParams();
  const [board, setBoard] = useState({ boardTitle: "", boardContent: "" });
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`/api/editBoard/${boardCode}/${boardNo}`)
      .then((res) => {
        setBoard(res.data.board);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          alert("해당 게시글이 존재하지 않습니다.");
          navigate("/");
        } else if (err.response?.status === 403) {
          alert("자신이 작성한 글만 수정 가능합니다.");
          navigate(`/board/${boardCode}/${boardNo}`);
        }
      });
  }, [boardCode, boardNo, navigate]);

  const handleChange = (e) => {
    setBoard({ ...board, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("boardTitle", board.boardTitle);
    formData.append("boardContent", board.boardContent);

    images.forEach((image, index) => {
      formData.append("images", image);
    });

    axios
      .post(`/api/editBoard/${boardCode}/${boardNo}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        alert(res.data.message);
        navigate(`/board/${boardCode}/${boardNo}`);
      })
      .catch((err) => {
        alert("게시글 수정에 실패했습니다.");
      });
  };

  return (
    <div className="edit-board-form">
      <h2>게시글 수정</h2>

      {/* board 정보가 로딩되지 않았으면 렌더링하지 않음 */}
      {!board ? (
        <p>로딩 중...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="boardTitle">제목</label>
          <input
            type="text"
            name="boardTitle"
            id="boardTitle"
            value={board.boardTitle || ""}
            onChange={handleChange}
            required
          />

          <label htmlFor="boardContent">내용</label>
          <textarea
            name="boardContent"
            id="boardContent"
            value={board.boardContent || ""}
            onChange={handleChange}
            required
          />

          <label htmlFor="images">이미지 첨부</label>
          <input
            type="file"
            name="images"
            id="images"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />

          <button type="submit">수정 완료</button>
        </form>
      )}
    </div>
  );
}
export default EditBoard;
