

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateTagList } from '../../utils/tagUtils';
import useAuthStore from '../../stores/useAuthStore';
function MyTownBoard() {
  const [boards, setBoards] = useState([]);
    const navigate = useNavigate();
 const { address } = useAuthStore();
  useEffect(() => {
    fetch('/api/board/mytownBoard')
      .then(res => res.json())
      .then(data => setBoards(data))
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div>
      <h2>📍 우리동네 게시판</h2> <h3>지역:{address}</h3>
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
  const tagList = generateTagList(board);
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
           <button
        onClick={() => navigate("/mytownBoard/write")}
        className="write-btn"
      >
        글쓰기
      </button>
    </div>

    
  );
  
}

export default MyTownBoard;