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

  // 이미지 경로가 상대경로인 경우 절대경로로 교체
  const contentWithImages = board.boardContent.replaceAll(
  /<img src="\/images\/board\//g,
  'http://localhost:80/images/board/'
);
const tagList = generateTagList(board);

return (
  <div>
    <h2>{board.boardTitle}</h2>
    <p><strong>작성자:</strong> {board.memberNickname}</p>
    <p><strong>작성일:</strong> {board.boardDate}</p>
    <p><strong>지역:</strong> {board.regionCity} {board.regionDistrict}</p>
{board.content}

      {/* ✅ 글 내용과 이미지가 섞인 HTML 출력 */}
      <div
        className="board-content"
        dangerouslySetInnerHTML={{ __html: contentWithImages }}
      />


        {/* {board.imageList && board.imageList.length > 0 && (
  <div className="board-images">
    {board.imageList.map((img, idx) => (
      <img
        key={img.imageNo || idx}
        src={img.imagePath}
        alt={`image-${idx}`}
        style={{ width: "100%", marginBottom: "10px" }}
      />
    ))}
  </div>
)} */}


  
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
