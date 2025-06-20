import React, { useEffect, useState } from "react";
import axios from "axios";
import BoardTable from "../components/BoardTable";

const MyTownBoard = () => {
  const [mytown, setMyTowns] = useState([]);

  useEffect(() => {
    axios.get("/board/json?code=3") // 우리동네 게시판 코드 3번 (예시)
      .then((res) => setMyTowns(res.data))
      .catch((err) => console.error("우리동네글 불러오기 실패", err));
  }, []);

  return <BoardTable boardList={mytown} title="우리동네 게시판" />;
};

export default MyTownBoard;
