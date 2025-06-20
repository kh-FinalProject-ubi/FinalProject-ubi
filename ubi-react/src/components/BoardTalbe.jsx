import React from "react";

const BoardTable = ({ boardList, title }) => {
  return (
    <div>
      <h2>{title}</h2>
      <table border="1" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>작성자</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {boardList.length === 0 ? (
            <tr>
              <td colSpan="4">게시글이 없습니다.</td>
            </tr>
          ) : (
            boardList.map((board) => (
              <tr key={board.boardNo}>
                <td>{board.boardNo}</td>
                <td>{board.boardTitle}</td>
                <td>{board.memberNickname || board.boardWriter}</td>
                <td>{new Date(board.boardDate).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BoardTable;
