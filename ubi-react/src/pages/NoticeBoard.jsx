import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";

const NoticeBoard = () => {
  const [noticeList, setNoticeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/noticeBoard", {
        params: { code: 1, cp: 1 },
        headers: { Accept: "application/json" },
      })
      .then((res) => {
        // res.data.boardList에 게시글 배열이 있음
        setNoticeList(res.data.boardList || []);
        setLoading(false);
        console.log(res.data.boardList); // 게시글 배열 확인용
        // 필요한 경우 페이지네이션 정보는 res.data.pagination에 있음
      })
      .catch((err) => {
        console.error("게시글 목록 로드 실패:", err);
        setLoading(false);
      });
  }, []);
  return (
    <>
      <Header />
      <div style={{ padding: "2rem" }}>
        <h2>공지사항</h2>
        <p>중요한 공지사항 및 업데이트 내용을 전달하는 공간입니다.</p>

        {loading ? (
          <p>로딩 중...</p>
        ) : (
          <ul>
            {noticeList.length === 0 ? (
              <li>등록된 공지사항이 없습니다.</li>
            ) : (
              noticeList.map((notice) => (
                <li key={notice.boardNo}>
                  <Link to={`/noticeBoard/${notice.boardNo}?code=5`}>
                    {notice.boardTitle}
                  </Link>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <Footer />
    </>
  );
};

export default NoticeBoard;
