import React, { useEffect, useState } from "react";
import axios from "axios";
import BoardTable from "../components/BoardTable";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get("/board/json?code=3")  // 공지 게시판 코드 3번 (예시)
      .then((res) => setNotices(res.data))
      .catch((err) => console.error("공지 불러오기 실패", err));
  }, []);

  return <BoardTable boardList={notices} title="공지사항" />;
};

export default NoticeBoard;
