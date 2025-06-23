import React, { useEffect, useState } from 'react';
import axios from 'axios';


const MyTownBoard = () => {
  const [boardList, setBoardList] = useState([]);
  
  useEffect(() => {
    axios.get('/mytownBoard')
      .then(res => {
         console.log('응답 데이터:', res.data); // 👈 여기에 배열이 나와야 함
        setBoardList(res.data);
      })
      .catch(err => console.error('게시판 불러오기 실패:', err));
  }, []);

   return (
    <div>
      <h2>우리 동네 게시판</h2>
      {boardList.length === 0 ? (
        <p>지역 일치 게시글이 없습니다.</p>
      ) : (
        <ul>
            {Array.isArray(boardList) && boardList.map(post => (
            <li key={post.boardNo}>
              <strong>{post.boardTitle}</strong> by {post.memberNickname} ({post.regionDistrict}, {post.regionCity})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


export default MyTownBoard;
