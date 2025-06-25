import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { generateTagList } from '../../utils/tagUtils';

function MyTownBoardDetail() {
  const { boardNo } = useParams();
  const [board, setBoard] = useState(null);
  

  useEffect(() => {
    fetch(`/api/board/mytownBoard/${boardNo}`)
      .then(res => res.json())
      .then(data => setBoard(data))
      .catch(err => console.error('Error:', err));
  }, [boardNo]);

if (!board) return <p>로딩 중...</p>; // ✅ null 방지

const tagList = generateTagList(board);
return (
  <div>
    <h2>{board.boardTitle}</h2>
    <p>{board.boardContent}</p>
    <p><strong>작성자:</strong> {board.memberNickname}</p>
    <p><strong>작성일:</strong> {board.boardDate}</p>
    <p><strong>지역:</strong> {board.regionCity} {board.regionDistrict}</p>

    {/* 해시태그 표시 */}
  <div style={{ marginTop: '10px', color: '#3b5998' }}>
    {tagList.map((tag, idx) => (
      <span key={idx}>#{tag} </span>
    ))}
  </div>

  </div>
);
}

export default MyTownBoardDetail;
