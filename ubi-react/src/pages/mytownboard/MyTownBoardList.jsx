

import { useEffect, useState } from "react";
import useAuthStore from "../../stores/useAuthStore";

function MyTownBoard() {
  const [boardList, setBoardList] = useState([]);
  const { token } = useAuthStore(); // Zustand로부터 token 가져오기

  useEffect(() => {
    if (!token) return; // 로그인 안 했으면 요청 X

    fetch("/api/board/mytownBoard", {
      method: "GET",
        headers: {
        Authorization: `Bearer ${token}`, // ✅ 토큰 인증 헤더
      //credentials: "include", // ✅ 세션 쿠키 보내기
          },

    })
      .then((res) => {
        if (!res.ok) throw new Error("로그인 필요");
        return res.json();
      })
      .then(setBoardList)
      .catch((err) => {
        console.error("게시글 조회 실패:", err);
      });
  }, [token]);

  return (
    <div>
      <h2>우리 동네 게시판</h2>
      {boardList.map((post) => (
        <div key={post.boardNo}>
          <h3>{post.boardTitle}</h3>
          <p>{post.boardContent}</p>
        </div>
      ))}
    </div>
  );
};



export default MyTownBoard;
