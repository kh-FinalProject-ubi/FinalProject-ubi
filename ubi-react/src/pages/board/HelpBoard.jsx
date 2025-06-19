import React, { useEffect, useState } from "react";
import axios from "axios";
import BoardTable from "../components/BoardTable";

const HelpBoard = () => {
  const [helps, setHelps] = useState([]);

  useEffect(() => {
    axios.get("/board/json?code=2") // 문의 게시판 코드 2번 (예시)
      .then((res) => setHelps(res.data))
      .catch((err) => console.error("문의글 불러오기 실패", err));
  }, []);

  return <BoardTable boardList={helps} title="문의게시판" />;
};

export default HelpBoard;
