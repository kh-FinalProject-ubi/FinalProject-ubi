
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";


const MyTownBoard = () => {
  const [searchParams] = useSearchParams();
  const cp = searchParams.get('cp') || 1;

  const [boardList, setBoardList] = useState([]);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    axios.get(`/board/mytown/list?cp=${cp}`)
      .then(res => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(res.data, "text/html");
        const boardData = JSON.parse(doc.querySelector('#boardListJson').textContent);
        const pageData = JSON.parse(doc.querySelector('#paginationJson').textContent);
        setBoardList(boardData);
        setPagination(pageData);
      })
      .catch(err => console.error(err));
  }, [cp]);

  return (



    <div className="board-wrapper">
      <h2>우리 동네 게시판</h2>
        {boardList.map((board) => (
        <div key={board.boardNo} className="board-card">
          <Link to={`/board/mytown/${board.boardNo}`}>
            <img src={board.thumbnail || '/img/default.png'} alt="썸네일" />
            <div className="content">
              <h4>{board.boardTitle}</h4>
              <p>{board.memberNickname}</p>
              <p>조회수: {board.boardReadCount}</p>
              {board.postType === '후기' && (
                <p>★ {board.starCount}/5</p>
              )}
              <span className="tag">{board.postType}</span>
            </div>
          </Link>
        </div>

        
      ))}
    </div>


  );
};


export default MyTownBoard;
