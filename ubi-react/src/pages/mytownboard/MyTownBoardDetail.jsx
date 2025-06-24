import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function MyTownBoardDetail() {
  const { boardNo } = useParams();
  const [board, setBoard] = useState(null);

  useEffect(() => {
    fetch(`/api/board/mytownBoard/${boardNo}`)
      .then(res => res.json())
      .then(data => setBoard(data))
      .catch(err => console.error('Error:', err));
  }, [boardNo]);

  if (!board) return <p>로딩 중...</p>;

  const imageList = board.imageList ? board.imageList.split(',') : [];

  return (
    <div>
      <h2>{board.boardTitle}</h2>
      <p>작성자: {board.memberNickname}</p>
      <p>작성일: {board.boardDate}</p>
      <p>조회수: {board.readCount} | 좋아요: {board.likeCount} | ⭐ {board.starCount ?? 0}</p>

      <div>
        {imageList.map((img, idx) => (
          <img key={idx} src={img} alt={`이미지${idx}`} width="200" style={{ margin: '10px 0' }} />
        ))}
      </div>

      <p>{board.boardContent}</p>

      <div style={{ marginTop: '10px' }}>
        {board.hashtags?.split(',').map((tag, i) => (
          <span key={i}>#{tag.trim()} </span>
        ))}
      </div>
    </div>
  );
}

export default MyTownBoardDetail;
