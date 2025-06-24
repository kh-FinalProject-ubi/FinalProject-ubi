

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
function MyTownBoard() {
  const [boards, setBoards] = useState([]);

  useEffect(() => {
    fetch('/api/board/mytownBoard')
      .then(res => res.json())
      .then(data => setBoards(data))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div>
      <h2>📍 우리동네 게시판</h2>
      <ul>
        {boards.map(board => (
          <li key={board.boardNo} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            <h3>
  <Link  to={`/mytownBoard/${board.boardNo}`}>
    {board.boardTitle}
 </Link>
</h3>
                 <img
  src={board.thumbnail || '/default-thumbnail.png'}
  alt="썸네일"
  width="120"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = '/default-thumbnail.png';
  }}/>
   
            <p><img src={board.memberImg || '/default-profile.png'} alt="프로필" width="40" height="40" style={{ borderRadius: '50%', marginRight: '10px' }} /> {board.memberNickname}</p>
            <p><strong>내용:</strong> {board.boardContent}...</p>
                        <p><strong>작성일:</strong> {board.boardDate}</p>
            <p><strong>지역:</strong> {board.regionCity} {board.regionDistrict}</p>
                      
                      
            <div>
              <span>조회수{board.boardReadCount}</span>
              <span>⭐ {board.starCount ?? 0}</span>
              <span style={{ marginLeft: '10px' }}>❤️ {board.likeCount}</span>
            </div>
          
          {(() => {
  const tagList = [];

  // 기존 DB 해시태그
  if (board.hashtags) {
    tagList.push(...board.hashtags.split(',').map(tag => tag.trim()));
  }

  // 시군구 해시태그 (예: #서울 강남구)
  if (board.regionCity && board.regionDistrict) {
    tagList.push(`${board.regionCity} ${board.regionDistrict}`);
  }

  // 복지 서비스 유형
  if (board.apiServiceId) {
    tagList.push('복지서비스후기');
  } else if (board.facilityApiServiceId) {
    tagList.push('복지시설후기');
  }

  return (
    <div style={{ marginTop: '5px', color: '#3b5998' }}>
      {tagList.map((tag, idx) => (
        <span key={idx}>#{tag} </span>
      ))}
    </div>
  );
})()}
            

          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyTownBoard;